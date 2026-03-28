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
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
