const HomeData = require('../models/homeData'); // Adjust path as needed
 const Employee = require('../models/addEmployee');

const createHomeData = async (req, res) => {
    try {
        const homeData = await HomeData.create({
            ...req.body,
            user_payment_datetime:new Date(),
            payment_status: 'pending' // Ensure status is always pending
        });
        return res.status(201).json(homeData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllHomeData = async (req, res) => {
    try {
        const homeDataList = await HomeData.findAll();
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updatePaymentInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            plan_id,
            plan_name,
            old_price,
            amount,
            payment_status,
            transaction_id 
        } = req.body;

        const [updated] = await HomeData.update({
            plan_id,
            plan_name,
            old_price,
            amount,
            payment_status,
            payment_date: new Date(),
            transaction_id
        }, {
            where: { id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'HomeData record not found' });
        }

        const updatedRecord = await HomeData.findByPk(id);
        return res.status(200).json(updatedRecord);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllPendingHomeData = async (req, res) => {
    try {
        const homeDataList = await HomeData.findAll({
            where: {
                payment_status: 'pending'
            }
        });
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get all paid home data
const getAllPaidHomeData = async (req, res) => {
    try {
        const homeDataList = await HomeData.findAll({
            where: {
                payment_status: 'paid'
            },
            include: [{
                model: Employee,
                as: 'employee', 
                attributes: ['name', 'last_loginat', 'last_logoutat']
            }]
        });
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

 
// Get HomeData by ID
const getHomeDataById = async (req, res) => {
    try {
        const homeData = await HomeData.findByPk(req.params.id);
        if (!homeData) {
            return res.status(404).json({ message: 'HomeData not found' });
        }
        return res.status(200).json(homeData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
 
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
 
// Delete HomeData entry
const deleteHomeData = async (req, res) => {
    try {
        const deleted = await HomeData.destroy({
            where: { id: req.params.id },
        });
        if (!deleted) {
            return res.status(404).json({ message: 'HomeData not found' });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
 
const getEmployeePaidHomeData = async (req, res) => {
    try {
        const { id } = req.params;
        
        const homeDataList = await HomeData.findAll({
            where: {
                payment_status: 'paid',
                emp_id: id
            },
            include: [{
                model: Employee,
                as: 'employee', 
                attributes: ['name', 'last_loginat', 'last_logoutat']
            }]
        });
        
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getEmployeePendingHomeData = async (req, res) => {
    try {
        const {id} = req.params;
        
        const homeDataList = await HomeData.findAll({
            where: {
                payment_status: 'pending',
                emp_id: id
            },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['name', 'last_loginat', 'last_logoutat']
            }]
        });

        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getEmployeeAllHomeData = async (req, res) => {
    try {
        const { id } = req.params;
        
        const homeDataList = await HomeData.findAll({
            where: {
                emp_id: id
            }
        });
        
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


// Add these to your module.exports
module.exports = {
    createHomeData,
    getAllHomeData,
    updatePaymentInfo,
    getAllPendingHomeData,
    getAllPaidHomeData,
    getHomeDataById,
    // updateHomeData,
    deleteHomeData,
    getEmployeePendingHomeData,
    getEmployeePaidHomeData,    // Added
    getEmployeeAllHomeData      // Added
};
 