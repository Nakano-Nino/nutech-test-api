import { Request, Response } from "express";
import { connect } from "../db";

export default new (class InformationController {
  async getAllBanners(req: Request, res: Response) {
    try {
      const connection = await connect();
      type QueryResult = any[];

      const banners: QueryResult = await connection.query(
        "SELECT * FROM banners"
      );
      if (banners[0] == null) {
        return res.status(404).json({
          status: 404,
          message: "Banner tidak ditemukan",
          data: null,
        });
      }

      let bannerData = [];
      for (let i = 0; i < banners[0].length; i++) {
        bannerData.push({
          banner_name: banners[0][i].banner_name,
          banner_image: banners[0][i].banner_image,
          description: banners[0][i].description,
        });
      }

      res.status(200).json({
        status: 0,
        message: "Sukses",
        data: bannerData,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
        data: null,
      });
    }
  }

  async getAllServices(req: Request, res: Response) {
    try {
      const connection = await connect();
      type QueryResult = any[];

      const services: QueryResult = await connection.query(
        "SELECT * FROM services"
      );
      if (services[0] == null) {
        return res.status(404).json({
          status: 404,
          message: "Service tidak ditemukan",
          data: null,
        });
      }

      res.status(200).json({
        status: 0,
        message: "Sukses",
        data: services[0],
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
        data: null,
      });
    }
  }
})();
