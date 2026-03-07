import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Chizo1412Za@",
    "database": "BusStop"
}

def update_camera_status(camera_id, status):
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    sql = """
        UPDATE Cameras
        SET Status = %s
        WHERE Camera_ID = %s
    """
    cursor.execute(sql, (status, camera_id))
    conn.commit()

    cursor.close()
    conn.close()
