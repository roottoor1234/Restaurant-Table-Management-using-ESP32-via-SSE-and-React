#include <esp_sleep.h>
#include <WiFi.h>
#include <HTTPClient.h>

const int switchPin = 15;
const char* ssid = "wifissid";
const char* password = "wifipassword";
const char* serverIP = "yourlocalip";
const int serverPort = 5000; // Port where your Node.js server is running
const char* serverEndpoint = "/send-message"; // Endpoint to send messages

// Define your ID here
const int deviceId = 1;

void setup() {
  Serial.begin(115200);

  pinMode(switchPin, INPUT_PULLUP);

  // Check if the ESP32 woke up from a deep sleep
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0) {
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.println("Connecting to WiFi...");
    }

    Serial.println("Connected to WiFi");

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin("http://" + String(serverIP) + ":" + String(serverPort) + serverEndpoint);

      http.addHeader("Content-Type", "application/json");

      // Replace "Your message from ESP32" with the actual message you want to send
      String message = "{\"id\":" + String(deviceId) + ",\"message\":\"Call\"}";

      int httpCode = http.POST(message);

      if (httpCode > 0) {
        Serial.printf("HTTP POST request sent with status code: %d\n", httpCode);
      } else {
        Serial.println("HTTP POST request failed");
      }

      http.end();
    }

    delay(2000); // Wait for 2 seconds (adjust as needed)
  } else {
    Serial.println("Going to sleep...");
  }

  // Configure wake up on falling edge of the switch
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_15, 0);

  // Enter deep sleep
  esp_deep_sleep_start();
}

void loop() {
  // This part won't be executed since the ESP32 is in deep sleep
}
