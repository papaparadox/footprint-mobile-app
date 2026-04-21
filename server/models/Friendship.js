const db = require("../database/connect");

class Friendship {
  constructor(id, requester_id, receiver_id, status, created_at, updated_at) {
    this.id = id;
    this.requester_id = requester_id;
    this.receiver_id = receiver_id;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static async searchUsers(currentUserId, username) {
    const result = await db.query(
      `
      SELECT id, username, email, home_country
      FROM users
      WHERE id <> $1
      AND username ILIKE $2
      ORDER BY username ASC
      `,
      [currentUserId, `%${username}%`],
    );

    return result.rows;
  }

  static async existingRelationship(userId1, userId2) {
    const result = await db.query(
      `
      SELECT * FROM friendships
      WHERE (requester_id = $1 AND receiver_id = $2)
         OR (requester_id = $2 AND receiver_id = $1)
      `,
      [userId1, userId2],
    );

    return result.rows[0] || null;
  }

  static async createRequest(requesterId, receiverId) {
    const result = await db.query(
      `
      INSERT INTO friendships (requester_id, receiver_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
      `,
      [requesterId, receiverId],
    );

    const row = result.rows[0];
    return new Friendship(
      row.id,
      row.requester_id,
      row.receiver_id,
      row.status,
      row.created_at,
      row.updated_at,
    );
  }

  static async getRequests(userId) {
    const incoming = await db.query(
      `
      SELECT f.*, u.username, u.email, u.home_country
      FROM friendships f
      JOIN users u ON f.requester_id = u.id
      WHERE f.receiver_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
      `,
      [userId],
    );

    const outgoing = await db.query(
      `
      SELECT f.*, u.username, u.email, u.home_country
      FROM friendships f
      JOIN users u ON f.receiver_id = u.id
      WHERE f.requester_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
      `,
      [userId],
    );

    return {
      incoming: incoming.rows,
      outgoing: outgoing.rows,
    };
  }

  static async updateRequestStatus(requestId, userId, status) {
    const result = await db.query(
      `
      UPDATE friendships
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND receiver_id = $3 AND status = 'pending'
      RETURNING *
      `,
      [status, requestId, userId],
    );

    if (result.rows.length === 0) {
      throw new Error("Friend request not found");
    }

    const row = result.rows[0];
    return new Friendship(
      row.id,
      row.requester_id,
      row.receiver_id,
      row.status,
      row.created_at,
      row.updated_at,
    );
  }

  static async getFriends(userId) {
    const result = await db.query(
      `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.home_country
      FROM friendships f
      JOIN users u
        ON (
          (f.requester_id = $1 AND u.id = f.receiver_id)
          OR
          (f.receiver_id = $1 AND u.id = f.requester_id)
        )
      WHERE f.status = 'accepted'
      ORDER BY u.username ASC
      `,
      [userId],
    );

    return result.rows;
  }

  static async removeFriend(userId, friendId) {
    const result = await db.query(
      `
      DELETE FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = $1 AND receiver_id = $2)
        OR
        (requester_id = $2 AND receiver_id = $1)
      )
      RETURNING *
      `,
      [userId, friendId],
    );

    if (result.rows.length === 0) {
      throw new Error("Friendship not found");
    }

    return result.rows[0];
  }

  static async areFriends(userId, friendId) {
    const result = await db.query(
      `
      SELECT * FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = $1 AND receiver_id = $2)
        OR
        (requester_id = $2 AND receiver_id = $1)
      )
      `,
      [userId, friendId],
    );

    return !!result.rows[0];
  }
}

module.exports = Friendship;
