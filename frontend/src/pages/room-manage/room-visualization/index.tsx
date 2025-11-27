import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, message, Spin, theme, Space, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import { DndProvider, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableRoomCard from './components/DraggableRoomCard';
import { useRequest } from '@umijs/max';
import { getRooms } from '@/services/api/fangjian';
import RoomFormModal from './components/RoomFormModal';

interface RoomPosition {
  id: number;
  left: number;
  top: number;
}

// 自定义拖动层组件
const CustomDragLayer: React.FC = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset || !item) {
    return null;
  }

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

  const room = item.room;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: currentOffset.x,
          top: currentOffset.y,
          width: 120,
          height: 100,
          opacity: 0.8,
        }}
      >
        <Card
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
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
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
        </Card>
      </div>
    </div>
  );
};

const RoomManage: React.FC = () => {
  const { token } = theme.useToken();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<API.Room | null>(null);
  const [roomPositions, setRoomPositions] = useState<RoomPosition[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  // 使用 useRequest 获取房间数据
  const { data: rooms, loading, run: reloadRooms } = useRequest(() => getRooms({ page_size: 100 }), {
    formatResult: (res) => (Array.isArray(res) ? res : res.data || []),
  });

  // 提取楼层数据
  const floors = rooms ? [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b) : [];

  // 根据楼层筛选房间
  const filteredRooms = rooms?.filter(
    (room) => room.floor === selectedFloor,
  );

  // 当房间数据加载完成后,初始化房间位置
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      // 检查是否已经有保存的位置数据(从 localStorage 或后端获取)
      const savedPositions = localStorage.getItem('roomPositions');
      
      if (savedPositions) {
        try {
          const parsed = JSON.parse(savedPositions);
          // 确保所有房间都有位置数据
          const positionsMap = new Map(parsed.map((p: RoomPosition) => [p.id, p]));
          const newPositions: RoomPosition[] = [];
          
          rooms.forEach((room, index) => {
            if (positionsMap.has(room.id)) {
              newPositions.push(positionsMap.get(room.id)!);
            } else {
              // 新房间,生成默认位置
              newPositions.push(generateDefaultPosition(room.id, index));
            }
          });
          
          setRoomPositions(newPositions);
        } catch (error) {
          console.error('Failed to parse saved positions:', error);
          initializeDefaultPositions();
        }
      } else {
        initializeDefaultPositions();
      }
    }
  }, [rooms]);

  // 生成默认位置(网格布局)
  const generateDefaultPosition = (id: number, index: number): RoomPosition => {
    const GRID_SIZE = 20; // 网格大小
    const cardWidth = 120; // 卡片宽度
    const cardHeight = 100; // 卡片高度
    const columns = 8; // 每行显示8个卡片
    
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    // 使用网格对齐的间距
    const horizontalSpacing = Math.ceil((cardWidth + 20) / GRID_SIZE) * GRID_SIZE; // 140
    const verticalSpacing = Math.ceil((cardHeight + 20) / GRID_SIZE) * GRID_SIZE; // 120
    
    return {
      id,
      left: col * horizontalSpacing + GRID_SIZE,
      top: row * verticalSpacing + GRID_SIZE,
    };
  };

  // 初始化所有房间的默认位置
  const initializeDefaultPositions = () => {
    if (!rooms) return;
    
    const positions = rooms.map((room, index) => generateDefaultPosition(room.id, index));
    setRoomPositions(positions);
  };

  // 处理拖拽结束,更新房间位置
  const handleDrop = (id: number, left: number, top: number) => {
    setRoomPositions((prevPositions) => {
      const newPositions = prevPositions.map((pos) =>
        pos.id === id ? { ...pos, left, top } : pos,
      );
      
      // 保存到 localStorage
      localStorage.setItem('roomPositions', JSON.stringify(newPositions));
      
      // TODO: 这里可以调用 API 保存到后端
      // await updateRoomPosition({ id, x: left, y: top });
      
      return newPositions;
    });
  };

  const handleOpenModal = (room: API.Room | null) => {
    setEditingRoom(room);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
  };

  const handleSuccess = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
    reloadRooms(); // 重新加载数据
  };

  const handleDelete = async (id: number) => {
    try {
      // 假设你有一个 deleteRoom 的 API 方法
      // await deleteRoom({ id });
      message.success(`房间 ${id} 删除成功(模拟)`);
      
      // 从位置数据中移除
      setRoomPositions((prev) => prev.filter((pos) => pos.id !== id));
      
      reloadRooms(); // 重新加载数据
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 保存布局
  const handleSaveLayout = () => {
    if (roomPositions.length === 0) {
      message.warning('没有需要保存的布局');
      return;
    }
    localStorage.setItem('roomPositions', JSON.stringify(roomPositions));
    message.success('布局已保存');
    // TODO: 这里可以调用 API 保存到后端
    // await saveRoomPositions(roomPositions);
  };

  // 重置布局
  const handleResetLayout = () => {
    initializeDefaultPositions();
    localStorage.removeItem('roomPositions');
    message.success('布局已重置');
  };

  return (
    <PageContainer
      title="房间可视化管理"
      extra={[
        <Button key="reset" onClick={handleResetLayout}>
          重置布局
        </Button>,
        <Button key="save" type="primary" onClick={handleSaveLayout}>
          保存布局
        </Button>,
      ]}
    >
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        {/* 楼层选择器 */}
        <Card 
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: '12px 16px' }}
        >
          <Space size="middle" align="center">
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: 14,
              color: token.colorPrimary,
            }}>
              选择楼层：
            </span>
            <Space size="small">
              {floors.map((floor) => (
                <Button
                  key={floor}
                  type={selectedFloor === floor ? 'primary' : 'default'}
                  onClick={() => setSelectedFloor(floor)}
                  size="middle"
                >
                  {floor}楼
                </Button>
              ))}
            </Space>
            <span style={{ color: token.colorTextSecondary, fontSize: 12 }}>
              当前显示: {selectedFloor}楼 - 共 {filteredRooms?.length || 0} 个房间
            </span>
          </Space>
        </Card>

        {/* 房间布局拖拽区域 */}
        <Card bodyStyle={{ padding: 0, position: 'relative' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <div
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '800px',
                height: 'calc(100vh - 280px)',
                backgroundColor: token.colorBgLayout,
                backgroundImage:
                  `linear-gradient(${token.colorSplit} 1px, transparent 1px), linear-gradient(90deg, ${token.colorSplit} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                overflow: 'auto',
              }}
            >
              {filteredRooms?.map((room) => {
                const position = roomPositions.find((pos) => pos.id === room.id);
                if (!position) return null;

                return (
                  <DraggableRoomCard
                    key={room.id}
                    room={room}
                    left={position.left}
                    top={position.top}
                    onEdit={() => handleOpenModal(room)}
                    onDelete={handleDelete}
                    onDrop={handleDrop}
                  />
                );
              })}
            </div>
          )}
        </Card>
      </DndProvider>

      <RoomFormModal
        visible={isModalVisible}
        room={editingRoom}
        onCancel={handleCancelModal}
        onSuccess={handleSuccess}
      />
    </PageContainer>
  );
};

export default RoomManage;
