import express, {} from "express";
import cors from "cors";
import identityRoutes from "./routes/identity.js";
import assetRoutes from "./routes/asset.js";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.json({
        name: "Decentralized Identity Asset Manager API",
        network: "Sepolia"
    });
});
app.use("/api/identity", identityRoutes);
app.use("/api/assets", assetRoutes);
export default app;
//# sourceMappingURL=app.js.map