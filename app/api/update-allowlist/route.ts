import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

export async function POST(request: Request) {
    const { addresses } = await request.json();

    try {
        if (!addresses || !Array.isArray(addresses)) {
            throw new Error('Addresses array required');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // Start transaction

            // Check if the table is empty and initialize if necessary
            const checkResult = await client.query('SELECT COUNT(*) FROM Allowlist');
            if (checkResult.rows[0].count === "0") {
                await client.query('INSERT INTO Allowlist (addresses) VALUES ($1)', [[]]); // Insert an empty array or a default value
            }

            // Update the addresses
            const { rows: updatedAddresses } = await client.query('UPDATE Allowlist SET addresses = $1 WHERE true RETURNING *', [addresses]);

            await client.query('COMMIT'); // Commit transaction
            client.release();

            return new Response(JSON.stringify({ updatedAddresses }), { status: 200 });
        } catch (error) {
            await client.query('ROLLBACK'); // Rollback transaction on error
            client.release();
            throw error; // Rethrow the error to be caught by the outer catch
        }
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}