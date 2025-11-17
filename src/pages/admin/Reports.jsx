import { useState, useEffect, useCallback } from 'react';
import { getAllReports, updateReportStatus, resolveReport } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { logger } from '../../utils/logger';
import ReportsHeader from '../../components/admin/reports/ReportsHeader';
import ReportsSearchBar from '../../components/admin/reports/ReportsSearchBar';
import ReportsFilters from '../../components/admin/reports/ReportsFilters';
import ReportsMobileCard from '../../components/admin/reports/ReportsMobileCard';
import ReportsTable from '../../components/admin/reports/ReportsTable';
import ReportDetailsModal from '../../components/admin/reports/ReportDetailsModal';
import ReportActionModal from '../../components/admin/reports/ReportActionModal';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, type: '', report: null });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { success: showSuccess, error: showError } = useToast();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllReports();
      logger.log('reports response:', response);

      const reportsData = response.reports || response.data?.reports || response?.data || [];
      logger.log('extracted reports:', reportsData);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      showError('failed to fetch reports');
      logger.error('error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId, status) => {
    try {
      await updateReportStatus(reportId, status);
      showSuccess(`report ${status} successfully`);
      fetchReports();
      setActionModal({ show: false, type: '', report: null });
    } catch (error) {
      showError('failed to update report status');
      logger.error('error updating report:', error);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await resolveReport(reportId, 'resolved by admin');
      showSuccess('report resolved successfully');
      fetchReports();
      setActionModal({ show: false, type: '', report: null });
    } catch (error) {
      showError('failed to resolve report');
      logger.error('error resolving report:', error);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const filteredReports = reports
    .filter(report => {
      if (filterStatus !== 'all' && report.status !== filterStatus) return false;
      return (
        report.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportedUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportsHeader pendingCount={reports.filter(r => r.status === 'pending').length} />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <ReportsSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <ReportsFilters
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No reports found
          </div>
        ) : (
          <>
            <ReportsMobileCard
              reports={filteredReports}
              activeDropdown={activeDropdown}
              onToggleDropdown={(id) => setActiveDropdown(activeDropdown === id ? null : id)}
              onViewReport={handleViewReport}
              onOpenActionModal={(type, report) => setActionModal({ show: true, type, report })}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />

            <ReportsTable
              reports={filteredReports}
              activeDropdown={activeDropdown}
              onToggleDropdown={(id) => setActiveDropdown(activeDropdown === id ? null : id)}
              onViewReport={handleViewReport}
              onOpenActionModal={(type, report) => setActionModal({ show: true, type, report })}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          </>
        )}
      </div>

      <ReportActionModal
        isOpen={actionModal.show && (actionModal.type === 'review' || actionModal.type === 'resolve')}
        type={actionModal.type}
        onClose={() => setActionModal({ show: false, type: '', report: null })}
        onConfirm={() => {
          if (actionModal.type === 'review') {
            handleUpdateStatus(actionModal.report._id, 'under_review');
          } else if (actionModal.type === 'resolve') {
            handleResolveReport(actionModal.report._id);
          }
        }}
      />

      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
      />
    </div>
  );
};

export default Reports;