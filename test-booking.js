async function runTest() {
    try {
        // We assume the backend uses port 8080 and we can hit POST /api/bookings
        // First, let's login as a client to get an auth token if needed, or simply send the booking request directly
        // Since we don't know the exact credentials, let's try to fetch a client and a provider, or just use ID 1 and 2

        // We can also try creating a test client and practitioner first if they don't exist

        const reqBody = {
            userId: 1,
            practitionerId: 2,
            bookingDate: "2026-03-01T10:00:00",
            notes: "Test booking without status field",
            // Notice 'status' is deliberately omitted!
        };

        const response = await fetch('http://localhost:8080/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody)
        });

        const text = await response.text();
        console.log("Status Code:", response.status);
        console.log("Response Body:", text);

        if (response.status === 200 && text.includes("PENDING")) {
            console.log("SUCCESS: Booking created with PENDING status automatically by the backend!");
        } else {
            console.log("FAILED to verify status or got error.");
        }
    } catch (error) {
        console.error("Error during test:", error);
    }
}
runTest();
