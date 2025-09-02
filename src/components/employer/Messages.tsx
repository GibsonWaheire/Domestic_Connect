import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, Mail, Clock, User, Reply, Trash2, Archive
} from 'lucide-react';
import { Message } from '@/types/employer';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface MessagesProps {
  messages: Message[];
}

export const Messages = ({ messages }: MessagesProps) => {
  const unreadCount = messages.filter(msg => !msg.isRead).length;
  const { showInfoNotification } = useNotificationActions();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {messages.map((message) => (
          <Card 
            key={message.id} 
            className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              !message.isRead ? 'ring-2 ring-blue-200' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{message.from}</h3>
                      {!message.isRead && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{message.timestamp}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.preview}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => {
                        showInfoNotification(
                          "Open Message", 
                          "Message viewing feature coming soon!"
                        );
                      }}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Read
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-green-50 hover:border-green-300 transition-colors"
                      onClick={() => {
                        showInfoNotification(
                          "Reply", 
                          "Reply feature coming soon!"
                        );
                      }}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      onClick={() => {
                        showInfoNotification(
                          "Archive", 
                          "Archive feature coming soon!"
                        );
                      }}
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                      onClick={() => {
                        showInfoNotification(
                          "Delete", 
                          "Delete feature coming soon!"
                        );
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
            <p className="text-gray-600 mb-4">When housegirls apply to your jobs, you'll see their messages here</p>
            <Button
              variant="outline"
              className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => {
                showInfoNotification(
                  "Post Job", 
                  "Create a job posting to start receiving applications!"
                );
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Post a Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
