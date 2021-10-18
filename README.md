## Description

Open-source, client-side deposit scanner for Monero wallets.

## How to Run in a Browser
1. Download and install [Monero CLI](https://getmonero.org/downloads/)
2. Start monero-daemon-rpc with authentication and CORS access.  For example: `./monerod --stagenet --rpc-login superuser:abctesting123 --rpc-access-control-origins http://localhost:8080`
3. `git clone https://github.com/woodser/monero-deposit-scanner`
4. `cd monero-deposit-scanner`
5. `npm install`
6. `npm start`
7. Access web app at http://localhost:8080 (opens automatically)

## UI Design
Initial design. See [design.pdf](design.pdf) for more mockups.
<p align="center">
	<img width="85%" height="auto" src="homepage.png"/><br>
</p>

## Support the developer

Send Monero donations to:
<p align="center">
  <img src="donationQR.png" width="300" height="300"/><br>
  <code>4735QZGCqASdjFvcFoJRkm6i8Z7fWWGAYe3PDS81hvnrjJj4J7kPoPbbYN9MBhru9xBRMPvi74TBXM19i2nRtykiFMDbG9n</code>
</p>


