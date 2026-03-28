use tauri::Manager;
use tauri_plugin_opener::OpenerExt;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_doc])
        .setup(|app| {
            let bytes = include_bytes!("../icons/128x128.png");
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
