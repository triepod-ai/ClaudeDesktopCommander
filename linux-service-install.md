# Linux Service Installation

To install the Ollama API Wrapper as a systemd service on Linux:

1. Edit the `ollama-api-wrapper.service` file and update:
   - `USERNAME` with your system username
   - `/path/to/ollama-api-wrapper` with the absolute path to the project directory

2. Copy the service file to the systemd directory:
   ```bash
   sudo cp ollama-api-wrapper.service /etc/systemd/system/
   ```

3. Reload the systemd daemon:
   ```bash
   sudo systemctl daemon-reload
   ```

4. Enable the service to start on boot:
   ```bash
   sudo systemctl enable ollama-api-wrapper.service
   ```

5. Start the service:
   ```bash
   sudo systemctl start ollama-api-wrapper.service
   ```

6. Check the service status:
   ```bash
   sudo systemctl status ollama-api-wrapper.service
   ```

To stop the service:
```bash
sudo systemctl stop ollama-api-wrapper.service
```

To uninstall the service:
```bash
sudo systemctl stop ollama-api-wrapper.service
sudo systemctl disable ollama-api-wrapper.service
sudo rm /etc/systemd/system/ollama-api-wrapper.service
sudo systemctl daemon-reload
```
