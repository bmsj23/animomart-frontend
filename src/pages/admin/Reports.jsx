import { useState, useEffect } from 'react';
import { getAllReports, updateReportStatus, resolveReport } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import { Search, AlertTriangle, MoreVertical, Eye, CheckCircle, User, Calendar, FileText } from 'lucide-react';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { logger } from '../../utils/logger';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, type: '', report: null });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getAllReports();
      console.log('reports response:', response);

      const reportsData = response.reports || response.data?.reports || response?.data || [];
      console.log('extracted reports:', reportsData);
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      showError('failed to fetch reports');
      logger.error('error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
          <p className="text-gray-600 mt-1">Review and handle user reports</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-2xl">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">{reports.filter(r => r.status === 'pending').length} Pending</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by reason, reporter, or reported user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all hover:cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-xl font-medium transition-all hover:cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('reviewed')}
              className={`px-4 py-2 rounded-xl font-medium transition-all hover:cursor-pointer ${
                filterStatus === 'reviewed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reviewed
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-4 py-2 rounded-xl font-medium transition-all hover:cursor-pointer ${
                filterStatus === 'resolved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* mobile card view */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No reports found
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-red-600" />
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {report._id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-2 line-clamp-2">{report.reason}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600">Reporter:</span>
                        <span className="text-gray-900 font-medium">{report.reporter?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600">Reported:</span>
                        <span className="text-gray-900 font-medium">{report.reportedUser?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === report._id ? null : report._id)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(report.priority || 'medium')}`}>
                    {report.priority || 'medium'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(report.createdAt)}</span>
                </div>

                {activeDropdown === report._id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => {
                        handleViewReport(report);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 hover:cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {report.status === 'pending' && (
                      <button
                        onClick={() => {
                          setActionModal({ show: true, type: 'reviewed', report });
                          setActiveDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-2 hover:cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Reviewed
                      </button>
                    )}
                    {report.status !== 'resolved' && (
                      <button
                        onClick={() => {
                          setActionModal({ show: true, type: 'resolve', report });
                          setActiveDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2 hover:cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reported User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, index) => (
                  <tr
                    key={report._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {report._id?.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{report.reporter?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{report.reportedUser?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 line-clamp-1">{report.reason}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(report.priority || 'medium')}`}>
                        {report.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">{formatDate(report.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === report._id ? null : report._id)}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {activeDropdown === report._id && (
                          <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 ${
                            index >= filteredReports.length - 3 ? 'bottom-8' : 'top-8 mt-2'
                          }`}>
                            <button
                              onClick={() => {
                                handleViewReport(report);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700 hover:cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            {report.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setActionModal({ show: true, type: 'review', report });
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-blue-50 text-blue-600 hover:cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                Mark as Reviewed
                              </button>
                            )}
                            {(report.status === 'pending' || report.status === 'reviewed') && (
                              <button
                                onClick={() => {
                                  setActionModal({ show: true, type: 'resolve', report });
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-green-50 text-green-600 hover:cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Resolve Report
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {actionModal.show && actionModal.type === 'review' && (
        <Modal
          isOpen={actionModal.show}
          onClose={() => setActionModal({ show: false, type: '', report: null })}
          title="mark report as reviewed"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <Eye className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-gray-700">
                Mark this report as reviewed? this indicates you have looked into the matter.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionModal({ show: false, type: '', report: null })}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors hover:cursor-pointer"
              >
                cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(actionModal.report._id, 'reviewed')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors hover:cursor-pointer"
              >
                Mark as Reviewed
              </button>
            </div>
          </div>
        </Modal>
      )}

      {actionModal.show && actionModal.type === 'resolve' && (
        <Modal
          isOpen={actionModal.show}
          onClose={() => setActionModal({ show: false, type: '', report: null })}
          title="resolve report"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-gray-700">
                resolve this report? this indicates the issue has been addressed and closed.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionModal({ show: false, type: '', report: null })}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors hover:cursor-pointer"
              >
                cancel
              </button>
              <button
                onClick={() => handleResolveReport(actionModal.report._id)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors hover:cursor-pointer"
              >
                resolve report
              </button>
            </div>
          </div>
        </Modal>
      )}

      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title="report details"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-gray-900">report ID</p>
              </div>
              <p className="font-mono text-sm text-gray-700">{selectedReport._id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">reporter</p>
                <p className="font-semibold text-gray-900">{selectedReport.reporter?.name || 'unknown'}</p>
                <p className="text-sm text-gray-600">{selectedReport.reporter?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">reported user</p>
                <p className="font-semibold text-gray-900">{selectedReport.reportedUser?.name || 'unknown'}</p>
                <p className="text-sm text-gray-600">{selectedReport.reportedUser?.email}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">reason</p>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-900">{selectedReport.reason}</p>
              </div>
            </div>

            {selectedReport.description && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">additional details</p>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-900">{selectedReport.description}</p>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">priority</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(selectedReport.priority || 'medium')}`}>
                    {selectedReport.priority || 'medium'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">reported at</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                </div>
                {selectedReport.resolvedAt && (
                  <div>
                    <p className="text-sm text-gray-600">resolved at</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedReport.resolvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Reports;