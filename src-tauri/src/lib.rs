use std::io::{Read, Write};
use std::sync::{Mutex, mpsc};
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_opener::OpenerExt;

struct SerialState {
    tx: Mutex<Option<mpsc::Sender<String>>>,
}

#[tauri::command]
fn open_doc(app: tauri::AppHandle, filename: String) -> Result<(), String> {
    let resource_path = app
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?
        .join("docs")
        .join(&filename);

    app.opener()
        .open_path(resource_path.to_string_lossy().as_ref(), None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn list_ports() -> Vec<String> {
    serialport::available_ports()
        .unwrap_or_default()
        .into_iter()
        .filter(|p| matches!(p.port_type, serialport::SerialPortType::UsbPort(_)))
        .map(|p| p.port_name)
        // On macOS prefer cu.* (outgoing) over tty.* (incoming) duplicates
        .filter(|name| !name.contains("/dev/tty."))
        .collect()
}

#[tauri::command]
fn open_port(
    port_name: String,
    app: AppHandle,
    state: State<'_, SerialState>,
) -> Result<(), String> {
    // Drop any existing connection first
    *state.tx.lock().unwrap() = None;

    let mut port = serialport::new(&port_name, 115_200)
        .timeout(std::time::Duration::from_millis(100))
        .open()
        .map_err(|e| e.to_string())?;

    let (tx, rx) = mpsc::channel::<String>();
    *state.tx.lock().unwrap() = Some(tx);

    std::thread::spawn(move || {
        let mut buf = [0u8; 512];
        let mut acc = String::new();

        loop {
            // Drain pending outbound commands
            loop {
                match rx.try_recv() {
                    Ok(cmd) => {
                        let line = format!("{}\n", cmd);
                        let _ = port.write_all(line.as_bytes());
                        let _ = port.flush();
                    }
                    Err(mpsc::TryRecvError::Empty) => break,
                    Err(mpsc::TryRecvError::Disconnected) => return,
                }
            }

            // Read available bytes (port timeout = 100 ms)
            match port.read(&mut buf) {
                Ok(0) => {}
                Ok(n) => {
                    acc.push_str(&String::from_utf8_lossy(&buf[..n]));
                    while let Some(pos) = acc.find('\n') {
                        let line = acc[..pos].trim().to_string();
                        acc = acc[pos + 1..].to_string();
                        if !line.is_empty() {
                            let _ = app.emit("serial-data", &line);
                        }
                    }
                }
                Err(e) if e.kind() == std::io::ErrorKind::TimedOut => {}
                Err(_) => {
                    let _ = app.emit("serial-closed", ());
                    return;
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn close_port(state: State<'_, SerialState>) {
    *state.tx.lock().unwrap() = None;
}

#[tauri::command]
fn send_serial(cmd: String, state: State<'_, SerialState>) -> Result<(), String> {
    let guard = state.tx.lock().unwrap();
    if let Some(tx) = guard.as_ref() {
        tx.send(cmd).map_err(|e| e.to_string())
    } else {
        Err("No port open".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SerialState { tx: Mutex::new(None) })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            open_doc,
            list_ports,
            open_port,
            close_port,
            send_serial,
        ])
        .setup(|app| {
            let bytes = include_bytes!("../icons/icon.png");
            let img = image::load_from_memory(bytes).expect("failed to load icon");
            let rgba = img.to_rgba8();
            let (w, h) = rgba.dimensions();
            let icon = tauri::image::Image::new_owned(rgba.into_raw(), w, h);
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_icon(icon);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
