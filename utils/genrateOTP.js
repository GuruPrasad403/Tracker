export default function GenerateOtp() {
    // Generate a 6-character strong OTP using crypto
    const OTP = Array.from(crypto.getRandomValues(new Uint8Array(6)))
        .map((num) => num % 10) // Ensure only digits (0-9)
        .join("");
    return OTP;
}

