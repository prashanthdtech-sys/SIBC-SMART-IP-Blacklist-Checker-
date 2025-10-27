# Smart IP Tool - Blacklist Checker

A web-based tool to check if an IP or a CIDR range is blacklisted across multiple DNSBLs. Its main purpose is to help maintain IP reputation and quickly identify blacklisted addresses.

---

## Features

- Check a single IP or a range of IPs.
- Supports CIDR notation (e.g., 45.38.9.0/24).
- Shows blacklisted IPs and the DNSBL sites.
- Provides direct links to removal pages for each blacklist.
- Persistent input/results using `localStorage`.
- Lightweight and fast with concurrent DNSBL checking.

---

## Prerequisites

- Node.js (v18+ recommended)
- npm (comes with Node.js)
- Modern browser (Chrome, Firefox, Edge, etc.)

---

# Setup Instruction
1. Clone the repo
2. Install backend dependencies: `cd Backend && npm install`
3. Create `.env` with `PORT=5000`
4. Start backend: `node server.js`
5. Open `Frontend/index.html` in browser

# Notes for Cloners

The real DNSBL folder containing full blacklist lists is hidden for privacy/security reasons.
The repo includes a sample DNSBL to allow testing the functionality.
You can test the app with the sample DNSBL immediately.
For real-world usage, replace the sample DNSBL with your own lists.
