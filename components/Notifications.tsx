import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { X, Check, Bell, AlertCircle, Zap, Gift } from 'lucide-react';

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onDismiss, isOpen, onClose }) => {
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Show toast for new unread notifications
    const unread = notifications.filter(n => !n.read);
    setDisplayNotifications(unread.slice(0, 3)); // Show max 3 toasts
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <AlertCircle className="text-blue-500" />;
      case 'challenge': return <Zap className="text-yellow-500" />;
      case 'reward': return <Gift className="text-purple-500" />;
      case 'reminder': return <Bell className="text-orange-500" />;
      default: return <Bell className="text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-blue-50 border-blue-200';
      case 'challenge': return 'bg-yellow-50 border-yellow-200';
      case 'reward': return 'bg-purple-50 border-purple-200';
      case 'reminder': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Modal View
  if (isOpen) {
    const sortedNotifications = [...notifications].sort((a, b) => b.createdAt - a.createdAt);
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 md:p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-4 md:p-6 flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3 text-white min-w-0">
              <Bell size={24} className="md:w-7 md:h-7 flex-shrink-0" />
              <h2 className="text-lg md:text-2xl font-black truncate">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-all flex-shrink-0 ml-2"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          <div className="p-4 md:p-6 space-y-2 md:space-y-3">
            {sortedNotifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell size={48} className="mx-auto opacity-20 mb-4" />
                <p className="text-lg font-semibold">No notifications yet</p>
                <p className="text-sm">Keep playing to earn achievements and rewards!</p>
              </div>
            ) : (
              sortedNotifications.map(notif => (
                <div key={notif.id} className={`p-4 rounded-2xl border-2 ${getBgColor(notif.type)} flex items-start gap-3`}>
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{notif.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onDismiss(notif.id)}
                    className="p-1 hover:bg-black/10 rounded-full transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Toast View (Bottom-right stacked notifications)
  return (
    <div className="fixed bottom-3 md:bottom-6 right-3 md:right-6 space-y-2 md:space-y-3 pointer-events-none z-40 max-w-xs md:max-w-sm">
      {displayNotifications.map((notif, idx) => (
        <div
          key={notif.id}
          className={`${getBgColor(notif.type)} border-2 rounded-2xl p-3 md:p-4 shadow-lg animate-fade-in pointer-events-auto`}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex items-start gap-2 md:gap-3">
            <div className="flex-shrink-0 mt-0.5 md:mt-1">{getIcon(notif.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 text-xs md:text-sm truncate">{notif.title}</h4>
              <p className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1 line-clamp-2">{notif.message}</p>
            </div>
            <button
              onClick={() => onDismiss(notif.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-1"
            >
              <X size={14} className="md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
