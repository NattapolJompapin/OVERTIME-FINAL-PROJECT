import mysql.connector

# -------------------------
# DATABASE CONFIG
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "Chizo1412Za@",
    "database": "BusStop"
}


def get_db_connection():
    """Create and return a database connection"""
    return mysql.connector.connect(**DB_CONFIG)


def init_database():
    """Initialize database and create required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS DensityCount (
            DensityCount_ID VARCHAR(10) PRIMARY KEY,
            Camera_ID VARCHAR(10) NOT NULL,
            Timestamp DATETIME NOT NULL,
            PassengerCount INT NOT NULL,
        )
    """)

    conn.commit()
    conn.close()
