const HomeData = require('../models/homeData'); // Adjust path as needed
 
// Create new HomeData entry
const createHomeData = async (req, res) => {
    try {
        const homeData = await HomeData.create(req.body);
        return res.status(201).json(homeData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
 
// Get all HomeData entries
const getAllHomeData = async (req, res) => {
    try {
        const homeDataList = await HomeData.findAll();
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
 
// // Get HomeData by ID
// const getHomeDataById = async (req, res) => {
//     try {
//         const homeData = await HomeData.findByPk(req.params.id);
//         if (!homeData) {
//             return res.status(404).json({ message: 'HomeData not found' });
//         }
//         return res.status(200).json(homeData);
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };
 
// // Update HomeData entry
// const updateHomeData = async (req, res) => {
//     try {
//         const [updated] = await HomeData.update(req.body, {
//             where: { id: req.params.id },
//         });
//         if (!updated) {
//             return res.status(404).json({ message: 'HomeData not found' });
//         }
//         const updatedHomeData = await HomeData.findByPk(req.params.id);
//         return res.status(200).json(updatedHomeData);
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };
 
// // Delete HomeData entry
// const deleteHomeData = async (req, res) => {
//     try {
//         const deleted = await HomeData.destroy({
//             where: { id: req.params.id },
//         });
//         if (!deleted) {
//             return res.status(404).json({ message: 'HomeData not found' });
//         }
//         return res.status(204).send();
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };
 
module.exports = {
    createHomeData,
    getAllHomeData,
    // getHomeDataById,
    // updateHomeData,
    // deleteHomeData,
};
 