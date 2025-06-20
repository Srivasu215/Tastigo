import Firm from "../Models/Firm.js";
import Vendor from "../Models/Vendor.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const addFirm = async (req, res) => {
    try {
        const { firmName, area, category, region, offer } = req.body;
        const image = req.file ? req.file.filename : undefined;

        const vendor = await Vendor.findById(req.vendorId);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        if (vendor.firm.length > 0) {
            return res.status(400).json({ message: "You can only add 1 firm" });
        }

        const firm = new Firm({
            firmName,
            area,
            category,
            region,
            offer,
            image,
            vendor: vendor._id
        });

        const savedFirm = await firm.save();
        const firmId = savedFirm._id;
        vendor.firm.push(savedFirm._id);
        await vendor.save();

        res.status(200).json({ message: "Firm added successfully", firmId: firmId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteById = async (req, res) => {
    try {
        const firmId = req.params.firmId;
        const firm = await Firm.findByIdAndDelete(firmId);
        if (!firm) {
            return res.status(404).json({ message: "Firm not found" });
        }
        res.status(200).json({ message: "Firm deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export { upload, addFirm, deleteById };
