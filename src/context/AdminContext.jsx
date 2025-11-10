import { createContext, useState, useEffect } from 'react';
import * as adminApi from '../api/admin';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';

// eslint-disable-next-line react-refresh/only-export-components
export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        pendingReports: 0
    });
    const [users, setUsers] = useState([]);
    const { isAuthenticated, isAdmin } = useAuth();

    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            fetchDashboardStats();
        } else {
            setStats({
                totalUsers: 0,
                totalProducts: 0,
                totalOrders: 0,
                pendingReports: 0
            });
        }
    }, [isAuthenticated, isAdmin]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);

            // fetch all data
            const results = await Promise.allSettled([
                adminApi.getAllUsers(),
                adminApi.getAllProducts(),
                adminApi.getAllOrders(),
                adminApi.getAllReports({ status: 'pending' }).catch(() => ({ data: [] }))
            ]);

            // extract data from settled promises
            const usersData = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
            const productsData = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
            const ordersData = results[2].status === 'fulfilled' ? results[2].value : { data: [] };
            const reportsData = results[3].status === 'fulfilled' ? results[3].value : { data: [] };

            // console.log('users data:', usersData);
            // console.log('products data:', productsData);
            // console.log('orders data:', ordersData);
            // console.log('reports data:', reportsData);

            setStats({
                totalUsers: usersData.data?.pagination?.totalUsers || usersData.data?.users?.length || usersData.users?.length || 0,
                totalProducts: productsData.data?.pagination?.totalProducts || productsData.data?.products?.length || productsData.products?.length || 0,
                totalOrders: ordersData.data?.pagination?.totalOrders || ordersData.data?.orders?.length || ordersData.orders?.length || 0,
                pendingReports: reportsData.data?.pagination?.totalReports || reportsData.data?.reports?.length || reportsData.reports?.length || 0
            });

        } catch (error) {
            logger.error('error fetching dashboard stats: ', error);
        } finally {
            setLoading(false);
        }
    }

    const suspendUser = async (userId, updatedData) => {
        try {
            const data = await adminApi.suspendUser(userId, updatedData);
                        setUsers({
                ...users,
                [userId]: {
                    ...users[userId],
                    ...data
                }
            });
        } catch (error) {
            logger.error('Error suspending user:', error);
            throw error;
        }
    }

    const value = {
        loading,
        users,
        suspendUser,
        stats,
        fetchDashboardStats
    }

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}