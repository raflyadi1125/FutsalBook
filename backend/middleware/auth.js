import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = Number(payload.sub);
    if (!Number.isInteger(id)) {
      return res.status(401).json({ message: "Token tidak valid" });
    }
    req.user = { id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Akses khusus admin" });
  }
  next();
}
