import React from 'react';
import { Card, Tag, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './DraggableFacilityCard';

interface DraggableRoomCardProps {
  room: API.Room;
  left: number;
  top: number;
  onEdit: () => void;
  onDelete: (id: number) => void;
  onDrop: (id: number, left: number, top: number) => void;
}

// 网格大小（与背景网格一致）
const GRID_SIZE = 20;

// 对齐到网格的函数
const snapToGrid = (x: number, y: number): [number, number] => {
  const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
  const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
  return [snappedX, snappedY];
};

const DraggableRoomCard: React.FC<DraggableRoomCardProps> = ({
  room,
  left,
  top,
  onEdit,
  onDelete,
  onDrop,
}) => {
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.ROOM_CARD,
      item: { id: room.id, left, top, room },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta && item.id) {
          const newLeft = item.left + delta.x;
          const newTop = item.top + delta.y;
          // 对齐到网格
          const [snappedLeft, snappedTop] = snapToGrid(newLeft, newTop);
          onDrop(item.id, snappedLeft, snappedTop);
        }
      },
    }),
    [room, left, top, onDrop],
  );

  // 使用空图片作为拖动预览，这样我们可以使用自定义的拖动层
  React.useEffect(() => {
    preview(new Image(), { captureDraggingState: true });
  }, [preview]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available':
        return '可用';
      case 'occupied':
        return '占用';
      case 'maintenance':
        return '维护中';
      default:
        return '未知';
    }
  };

  return (
    <div
      ref={drag as any}
      style={{
        position: 'absolute',
        left,
        top,
        opacity: isDragging ? 0 : 1,
        cursor: 'move',
        width: 120,
        height: 100,
      }}
    >
      <Card
        hoverable
        size="small"
        bodyStyle={{
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
        style={{
          boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
          height: '100%',
          border: `2px solid ${
            room.status === 'available' ? '#52c41a' :
            room.status === 'occupied' ? '#ff4d4f' :
            room.status === 'maintenance' ? '#faad14' : '#d9d9d9'
          }`,
          backgroundColor: 
            room.status === 'available' ? '#f6ffed' :
            room.status === 'occupied' ? '#fff1f0' :
            room.status === 'maintenance' ? '#fffbe6' : '#fafafa',
        }}
      >
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            marginBottom: 8,
            color: '#000',
          }}>
            {room.room_number}
          </div>
          <Tag 
            color={getStatusColor(room.status)}
            style={{ margin: 0, fontSize: '12px' }}
          >
            {getStatusText(room.status)}
          </Tag>
        </div>
        
        {/* 悬浮时显示操作按钮 */}
        <div
          className="room-card-actions"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            display: 'none',
          }}
        >
          <Space size={2}>
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={onEdit}
              style={{ fontSize: 12, padding: 2 }}
            />
            <Popconfirm
              title="确定要删除这个房间吗？"
              onConfirm={() => room.id && onDelete(room.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="text" 
                size="small" 
                danger 
                icon={<DeleteOutlined />}
                style={{ fontSize: 12, padding: 2 }}
              />
            </Popconfirm>
          </Space>
        </div>
      </Card>
      
      <style>{`
        .ant-card:hover .room-card-actions {
          display: block !important;
        }
      `}</style>
    </div>
  );
};

export default DraggableRoomCard;
