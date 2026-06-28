import os
import subprocess
import time
import socket
import sys

# Get absolute paths relative to the script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, "logs")
os.makedirs(LOGS_DIR, exist_ok=True)

# Port configuration
BACKEND_PORT = 8000
FRONTEND_PORT = 3000

def kill_process_on_port(port):
    """Finds and terminates any process listening on the specified port (Windows)."""
    try:
        cmd = f'netstat -ano | findstr :{port}'
        output = subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore')
        pids = set()
        for line in output.strip().split('\n'):
            parts = line.split()
            if len(parts) >= 5:
                local_addr = parts[1]
                if f":{port}" in local_addr:
                    pids.add(parts[-1])
        
        for pid in pids:
            if pid != '0':
                print(f"Killing process {pid} listening on port {port}...")
                subprocess.run(f"taskkill /F /PID {pid}", shell=True)
                time.sleep(0.5)
    except subprocess.CalledProcessError:
        pass

def wait_for_port(port, timeout=20):
    """Waits for a port to become active and verified as LISTENING (no false positives)."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(1)
            result = sock.connect_ex(('127.0.0.1', port))
            if result == 0:
                try:
                    netstat_out = subprocess.check_output(f"netstat -ano", shell=True).decode('utf-8')
                    for line in netstat_out.strip().split('\n'):
                        parts = line.split()
                        if len(parts) >= 4 and parts[3] == "LISTENING":
                            local_addr = parts[1]
                            if local_addr.endswith(f":{port}"):
                                return True
                except subprocess.CalledProcessError:
                    pass
        time.sleep(1)
    return False

def generate_batch_files(base_dir, python_exe):
    """Generates the helper batch files with dynamic absolute paths."""
    backend_bat_path = os.path.join(base_dir, "run_backend.bat")
    frontend_bat_path = os.path.join(base_dir, "run_frontend.bat")
    backend_log = os.path.join(base_dir, "logs", "backend.log")
    frontend_log = os.path.join(base_dir, "logs", "frontend.log")
    
    with open(backend_bat_path, "w", encoding="utf-8") as f:
        f.write('@echo off\n')
        f.write(f'cd /d "{base_dir}"\n')
        f.write(f'"{python_exe}" -m uvicorn apps.api.main:app --reload --port {BACKEND_PORT} < nul > "{backend_log}" 2>&1\n')
        
    with open(frontend_bat_path, "w", encoding="utf-8") as f:
        f.write('@echo off\n')
        f.write(f'cd /d "{base_dir}"\n')
        f.write(f'npm run dev:web < nul > "{frontend_log}" 2>&1\n')
        
    print(f"Generated {backend_bat_path}")
    print(f"Generated {frontend_bat_path}")

def main():
    print("--- Starting Due Diligence Engine Servers via Windows Task Scheduler ---")
    
    # 1. Clean up any existing instances on ports 8000 and 3000
    print("Cleaning up existing processes...")
    kill_process_on_port(BACKEND_PORT)
    kill_process_on_port(FRONTEND_PORT)
    
    # 2. End and delete old tasks if they exist
    print("Resetting scheduled tasks...")
    subprocess.run('schtasks /end /tn "due_diligence_backend"', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run('schtasks /delete /tn "due_diligence_backend" /f', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run('schtasks /end /tn "due_diligence_frontend"', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run('schtasks /delete /tn "due_diligence_frontend" /f', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Configure paths
    python_exe = os.path.join(BASE_DIR, "apps", "api", ".venv", "Scripts", "python.exe")
    if not os.path.exists(python_exe):
        python_exe = sys.executable

    # 3. Generate batch files
    generate_batch_files(BASE_DIR, python_exe)
    
    backend_bat = os.path.join(BASE_DIR, "run_backend.bat")
    frontend_bat = os.path.join(BASE_DIR, "run_frontend.bat")
    
    # 4. Create and start Backend Task
    print("Creating and running backend task...")
    create_backend_cmd = f'schtasks /create /tn "due_diligence_backend" /tr "\\"{backend_bat}\\"" /sc once /st 00:00 /f'
    res = subprocess.run(create_backend_cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Failed to create backend task: {res.stderr}")
    else:
        subprocess.run('schtasks /run /tn "due_diligence_backend"', shell=True, stdout=subprocess.DEVNULL)
        
    # 5. Create and start Frontend Task
    print("Creating and running frontend task...")
    create_frontend_cmd = f'schtasks /create /tn "due_diligence_frontend" /tr "\\"{frontend_bat}\\"" /sc once /st 00:00 /f'
    res = subprocess.run(create_frontend_cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Failed to create frontend task: {res.stderr}")
    else:
        subprocess.run('schtasks /run /tn "due_diligence_frontend"', shell=True, stdout=subprocess.DEVNULL)
        
    # 6. Verify they are up
    print("Waiting for Backend to start...")
    if wait_for_port(BACKEND_PORT, timeout=20):
        print(f"[OK] Backend started successfully on http://127.0.0.1:{BACKEND_PORT}")
    else:
        print(f"[WARNING] Backend didn't start on port {BACKEND_PORT} within timeout. Check logs/backend.log")
        
    print("Waiting for Frontend to start...")
    if wait_for_port(FRONTEND_PORT, timeout=30):
        print(f"[OK] Frontend started successfully on http://localhost:{FRONTEND_PORT}")
    else:
        print(f"[WARNING] Frontend didn't start on port {FRONTEND_PORT} within timeout. Check logs/frontend.log")

    print("\nBoth servers are running in the background via Windows Task Scheduler.")
    print("They are completely independent of the IDE session and will continue to run after you close it.")
    print("To stop them later, you can run the 'stop_detached.py' script.")

if __name__ == "__main__":
    main()
