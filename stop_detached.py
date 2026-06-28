import subprocess
import time

BACKEND_PORT = 8000
FRONTEND_PORT = 3000

def kill_process_on_port(port):
    """Finds and terminates any process listening on the specified port (Windows)."""
    try:
        # Find PID using netstat
        cmd = f'netstat -ano | findstr :{port}'
        output = subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore')
        pids = set()
        for line in output.strip().split('\n'):
            parts = line.split()
            if len(parts) >= 5:
                local_addr = parts[1]
                if f":{port}" in local_addr:
                    pids.add(parts[-1])
        
        if not pids:
            return
            
        for pid in pids:
            if pid != '0':
                print(f"Stopping process {pid} on port {port}...")
                subprocess.run(f"taskkill /F /PID {pid}", shell=True)
                time.sleep(0.5)
    except subprocess.CalledProcessError:
        pass

def main():
    print("--- Stopping Due Diligence Engine Servers and Scheduled Tasks ---")
    
    # End and delete scheduled tasks
    print("Stopping and deleting scheduled tasks...")
    subprocess.run('schtasks /end /tn "due_diligence_backend"', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run('schtasks /delete /tn "due_diligence_backend" /f', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    subprocess.run('schtasks /end /tn "due_diligence_frontend"', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run('schtasks /delete /tn "due_diligence_frontend" /f', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Kill any lingering ports
    print("Checking for any lingering processes...")
    kill_process_on_port(BACKEND_PORT)
    kill_process_on_port(FRONTEND_PORT)
    
    print("Done.")

if __name__ == "__main__":
    main()
