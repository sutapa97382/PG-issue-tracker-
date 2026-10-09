/**
 * Generates a unique room secret key in format:
 * ROOM-{roomNumber}-{4 random uppercase alphanumeric chars}
 * Example: ROOM-R102-7XK9
 */
export const generateRoomSecretKey = (roomNumber) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const cleanRoomNumber = (roomNumber || 'ROOM').toString().trim().toUpperCase();
  return `ROOM-${cleanRoomNumber}-${random}`;
};
