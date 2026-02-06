# LabToolKit

Mobile-friendly lab tools for wet-lab bench work. The current prototype includes a molarity calculator, PubChem molecular-weight lookup (with optional voice input/output), and a master mix calculator.

## Run locally

You can run the app on any platform that has Python 3 installed (Windows, macOS, or Linux).

1. Open a terminal.
2. Navigate to the project folder:
   ```bash
   cd /workspace/ChatGPT-test
   ```
3. Start a simple web server:
   ```bash
   python -m http.server 8000
   ```
4. Open your browser and go to `http://localhost:8000`.

> Note: Voice input/output relies on the browser Web Speech APIs, which are best supported in Chromium-based browsers and typically require HTTPS or `localhost`.

## Quick self-test checklist

1. **Molarity calculator**: Enter mass + molar weight and click **Calculate**. Confirm moles populate automatically.
2. **PubChem search**: Enter a compound name (e.g., sodium chloride) and click **Search**. Confirm the molar weight appears and the link opens PubChem.
3. **Voice search**: Click **Start voice input** and ask for a molar weight. Confirm a response appears (requires a supported browser).
4. **Master mix calculator**: Enter a final volume per reaction and number of reactions, add a component with stock + final concentration, then click **Calculate master mix**. Confirm volumes appear and buffer volume is calculated.
