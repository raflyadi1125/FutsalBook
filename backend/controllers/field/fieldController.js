import * as fieldModel from "../../models/fieldModel.js";

export async function list(req, res, next) {
  try {
    res.json({ fields: await fieldModel.findAll() });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const field = await fieldModel.findById(req.params.id);
    if (!field) return res.status(404).json({ message: "Lapangan tidak ditemukan" });
    res.json({ field });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { name, description, price, status } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "name wajib diisi" });
    }
    const priceNum = Number(price);
    if (price == null || !Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "price harus berupa angka >= 0" });
    }
    const fieldStatus = status ?? "active";
    if (!["active", "inactive"].includes(fieldStatus)) {
      return res.status(400).json({ message: "status harus active atau inactive" });
    }
    const field = await fieldModel.create({
      name: String(name).trim(),
      description: description ?? null,
      price: priceNum,
      status: fieldStatus,
    });
    res.status(201).json({ field });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { name, description, price, status } = req.body;
    const patch = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: "name tidak boleh kosong" });
      }
      patch.name = String(name).trim();
    }
    if (description !== undefined) patch.description = description ?? null;
    if (price !== undefined) {
      const priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        return res.status(400).json({ message: "price harus berupa angka >= 0" });
      }
      patch.price = priceNum;
    }
    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "status harus active atau inactive" });
      }
      patch.status = status;
    }

    const field = await fieldModel.update(req.params.id, patch);
    if (!field) return res.status(404).json({ message: "Lapangan tidak ditemukan" });
    res.json({ field });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const ok = await fieldModel.remove(req.params.id);
    if (!ok) return res.status(404).json({ message: "Lapangan tidak ditemukan" });
    res.json({ message: "Lapangan dihapus" });
  } catch (err) {
    next(err);
  }
}
