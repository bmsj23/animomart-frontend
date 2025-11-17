import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FileText, User, Calendar, MoreVertical, Eye, CheckCircle } from 'lucide-react';

const ReportsTable = ({
  reports,
  onViewReport,
  onOpenActionModal,
  formatDate,
  getStatusColor,
  getPriorityColor,
}) => {
  const [dropdownState, setDropdownState] = useState({
    isOpen: false,
    activeReportId: null,
    position: {},
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownState((prev) => ({ ...prev, isOpen: false }));
      }
    };

    const handleScroll = () => {
      if (dropdownState.isOpen) {
        setDropdownState((prev) => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [dropdownState.isOpen]);

  const handleToggleDropdown = (e, reportId) => {
    e.stopPropagation();
    e.preventDefault();

    if (dropdownState.isOpen && dropdownState.activeReportId === reportId) {
      setDropdownState({ isOpen: false, activeReportId: null, position: {} });
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const GAP = 8;
    const DROPDOWN_HEIGHT = 180;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let newPosition = {};

    const spaceBelow = viewportHeight - rect.bottom;
    const shouldAlignAbove = spaceBelow < DROPDOWN_HEIGHT && rect.top > DROPDOWN_HEIGHT;

    if (shouldAlignAbove) {
       newPosition.bottom = (viewportHeight - rect.top) + GAP;
       newPosition.top = 'auto';
    } else {
       newPosition.top = rect.bottom + GAP;
       newPosition.bottom = 'auto';
    }

    if (rect.right > viewportWidth / 2) {
      newPosition.right = viewportWidth - rect.right;
      newPosition.left = 'auto';
    } else {
      newPosition.left = rect.left;
      newPosition.right = 'auto';
    }

    setDropdownState({
      isOpen: true,
      activeReportId: reportId,
      position: newPosition,
    });
  };

  const activeReport = reports.find(r => r._id === dropdownState.activeReportId);

  return (
    <>
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Report ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reporter</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reported User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report._id} className="hover:bg-gray-50 transition-colors">
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
                      onClick={(e) => handleToggleDropdown(e, report._id)}
                      className={`p-1 rounded-lg transition-colors hover:cursor-pointer ${
                        dropdownState.activeReportId === report._id ? 'bg-gray-200' : 'hover:bg-gray-200'
                      }`}
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dropdownState.isOpen && activeReport && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2"
          style={{
            ...dropdownState.position,
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => {
              onViewReport(activeReport);
              setDropdownState(prev => ({ ...prev, isOpen: false }));
            }}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700 hover:cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>

          {activeReport.status === 'pending' && (
            <button
              onClick={() => {
                onOpenActionModal('review', activeReport);
                setDropdownState(prev => ({ ...prev, isOpen: false }));
              }}
              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-blue-50 text-blue-600 hover:cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Mark as Reviewed
            </button>
          )}

          {(activeReport.status === 'pending' || activeReport.status === 'reviewed') && (
            <button
              onClick={() => {
                onOpenActionModal('resolve', activeReport);
                setDropdownState(prev => ({ ...prev, isOpen: false }));
              }}
              className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-green-50 text-green-600 hover:cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve Report
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default ReportsTable;