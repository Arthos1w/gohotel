import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, message, Spin, theme, Space, Tag, Tooltip, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { DndProvider, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableRoomCard from './components/DraggableRoomCard';
import DraggableFacilityCard, {
  FacilityConfig,
  FacilityType,
  Facility,
  ItemTypes,
} from './components/DraggableFacilityCard';
import { useRequest } from '@umijs/max';
import { getRooms } from '@/services/api/fangjian';
import RoomFormModal from './components/RoomFormModal';
import Iconfont from '@/components/Iconfont';

interface RoomPosition {
  id: number;
  left: number;
  top: number;
}

// 自定义拖动层组件
const CustomDragLayer: React.FC = () => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
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

  // 渲染房间拖动预览
  if (itemType === ItemTypes.ROOM_CARD && item.room) {
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
                room.status === 'available'
                  ? '#52c41a'
                  : room.status === 'occupied'
                    ? '#ff4d4f'
                    : room.status === 'maintenance'
                      ? '#faad14'
                      : '#d9d9d9'
              }`,
              backgroundColor:
                room.status === 'available'
                  ? '#f6ffed'
                  : room.status === 'occupied'
                    ? '#fff1f0'
                    : room.status === 'maintenance'
                      ? '#fffbe6'
                      : '#fafafa',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: 8,
                  color: '#000',
                }}
              >
                {room.room_number}
              </div>
              <Tag color={getStatusColor(room.status)} style={{ margin: 0, fontSize: '12px' }}>
                {getStatusText(room.status)}
              </Tag>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 渲染设施拖动预览
  if (itemType === ItemTypes.FACILITY_CARD && item.facility) {
    const facility = item.facility as Facility;
    const config = FacilityConfig[facility.type];
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
            width: facility.width,
            height: facility.height,
            opacity: 0.8,
          }}
        >
          <Card
            size="small"
            bodyStyle={{
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
            style={{
              height: '100%',
              border: `2px dashed ${config.color}`,
              backgroundColor: config.bgColor,
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            }}
          >
            <Iconfont name={config.icon} size={24} color={config.color} />
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: config.color }}>
              {facility.label || config.name}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

const RoomManage: React.FC = () => {
  const { token } = theme.useToken();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<API.Room | null>(null);
  const [roomPositions, setRoomPositions] = useState<RoomPosition[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // 使用 useRequest 获取房间数据
  const {
    data: rooms,
    loading,
    run: reloadRooms,
  } = useRequest<API.Room[]>(() => getRooms({ page_size: 100 }), {
    formatResult: (res: any): API.Room[] => (Array.isArray(res) ? res : res.data || []),
  });

  // 提取楼层数据
  const floors: number[] = rooms 
    ? ([...new Set(rooms.map((r: API.Room) => r.floor || 1))] as number[]).sort((a: number, b: number) => a - b) 
    : [];

  // 根据楼层筛选房间
  const filteredRooms = rooms?.filter((room: API.Room) => room.floor === selectedFloor);

  // 根据楼层筛选设施
  const filteredFacilities = facilities.filter((f) => f.floor === selectedFloor);

  // 当房间数据加载完成后,初始化房间位置
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const savedPositions = localStorage.getItem('roomPositions');

      if (savedPositions) {
        try {
          const parsed = JSON.parse(savedPositions) as RoomPosition[];
          const positionsMap = new Map(parsed.map((p: RoomPosition) => [p.id, p]));
          const newPositions: RoomPosition[] = [];

          rooms.forEach((room: API.Room, index: number) => {
            if (room.id && positionsMap.has(room.id)) {
              newPositions.push(positionsMap.get(room.id) as RoomPosition);
            } else if (room.id) {
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

  // 加载保存的设施数据
  useEffect(() => {
    const savedFacilities = localStorage.getItem('floorFacilities');
    if (savedFacilities) {
      try {
        setFacilities(JSON.parse(savedFacilities));
      } catch (error) {
        console.error('Failed to parse saved facilities:', error);
      }
    }
  }, []);

  // 生成默认位置(网格布局)
  const generateDefaultPosition = (id: number, index: number): RoomPosition => {
    const GRID_SIZE = 20;
    const cardWidth = 120;
    const cardHeight = 100;
    const columns = 8;

    const row = Math.floor(index / columns);
    const col = index % columns;

    const horizontalSpacing = Math.ceil((cardWidth + 20) / GRID_SIZE) * GRID_SIZE;
    const verticalSpacing = Math.ceil((cardHeight + 20) / GRID_SIZE) * GRID_SIZE;

    return {
      id,
      left: col * horizontalSpacing + GRID_SIZE,
      top: row * verticalSpacing + GRID_SIZE,
    };
  };

  // 初始化所有房间的默认位置
  const initializeDefaultPositions = () => {
    if (!rooms) return;
    const positions = rooms
      .filter((room: API.Room) => room.id !== undefined)
      .map((room: API.Room, index: number) => generateDefaultPosition(room.id!, index));
    setRoomPositions(positions);
  };

  // 处理房间拖拽结束
  const handleRoomDrop = (id: number, left: number, top: number) => {
    setRoomPositions((prevPositions) => {
      const newPositions = prevPositions.map((pos) =>
        pos.id === id ? { ...pos, left, top } : pos,
      );
      localStorage.setItem('roomPositions', JSON.stringify(newPositions));
      return newPositions;
    });
  };

  // 处理设施拖拽结束
  const handleFacilityDrop = (id: string, left: number, top: number) => {
    setFacilities((prev) => {
      const newFacilities = prev.map((f) => (f.id === id ? { ...f, left, top } : f));
      localStorage.setItem('floorFacilities', JSON.stringify(newFacilities));
      return newFacilities;
    });
  };

  // 添加设施
  const handleAddFacility = (type: FacilityType) => {
    const config = FacilityConfig[type];
    const newFacility: Facility = {
      id: `facility_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      floor: selectedFloor,
      left: 20,
      top: 20,
      width: config.defaultWidth,
      height: config.defaultHeight,
    };

    setFacilities((prev) => {
      const newFacilities = [...prev, newFacility];
      localStorage.setItem('floorFacilities', JSON.stringify(newFacilities));
      return newFacilities;
    });

    message.success(`已添加 ${config.name}`);
  };

  // 删除设施
  const handleDeleteFacility = (id: string) => {
    setFacilities((prev) => {
      const newFacilities = prev.filter((f) => f.id !== id);
      localStorage.setItem('floorFacilities', JSON.stringify(newFacilities));
      return newFacilities;
    });
    message.success('设施已删除');
  };

  // 旋转设施（交换宽高）
  const handleRotateFacility = (id: string) => {
    setFacilities((prev) => {
      const newFacilities = prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            width: f.height,
            height: f.width,
            rotation: ((f.rotation || 0) + 90) % 360,
          };
        }
        return f;
      });
      localStorage.setItem('floorFacilities', JSON.stringify(newFacilities));
      return newFacilities;
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
    reloadRooms();
  };

  const handleDelete = async (id: number) => {
    try {
      message.success(`房间 ${id} 删除成功(模拟)`);
      setRoomPositions((prev) => prev.filter((pos) => pos.id !== id));
      reloadRooms();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 保存布局
  const handleSaveLayout = () => {
    localStorage.setItem('roomPositions', JSON.stringify(roomPositions));
    localStorage.setItem('floorFacilities', JSON.stringify(facilities));
    message.success('布局已保存');
  };

  // 重置布局
  const handleResetLayout = () => {
    initializeDefaultPositions();
    // 只清除当前楼层的设施
    setFacilities((prev) => {
      const newFacilities = prev.filter((f) => f.floor !== selectedFloor);
      localStorage.setItem('floorFacilities', JSON.stringify(newFacilities));
      return newFacilities;
    });
    localStorage.removeItem('roomPositions');
    message.success('当前楼层布局已重置');
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

        {/* 设施工具栏 */}
        <Card
          size="small"
          title="添加设施"
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: '12px 16px' }}
        >
          <Space wrap size="small">
            {Object.entries(FacilityConfig).map(([type, config]) => (
              <Tooltip key={type} title={`添加${config.name}`}>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleAddFacility(type as FacilityType)}
                  style={{
                    borderColor: config.color,
                    color: config.color,
                  }}
                >
                  <Iconfont name={config.icon} size={14} color={config.color} style={{ marginLeft: 4, marginRight: 4 }} />
                  {config.name}
                </Button>
              </Tooltip>
            ))}
          </Space>
          <Divider style={{ margin: '12px 0' }} />
          <Space size="middle">
            <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
              💡 提示：点击按钮添加设施到当前楼层，拖拽可调整位置，悬浮可删除/旋转
            </span>
          </Space>
        </Card>

        {/* 楼层选择器 */}
        <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px 16px' }}>
          <Space size="middle" align="center">
            <span
              style={{
                fontWeight: 'bold',
                fontSize: 14,
                color: token.colorPrimary,
              }}
            >
              选择楼层：
            </span>
            <Space size="small">
              {floors.map((floor: number) => (
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
              当前显示: {selectedFloor}楼 - 房间 {filteredRooms?.length || 0} 个，设施{' '}
              {filteredFacilities.length} 个
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
                height: 'calc(100vh - 380px)',
                backgroundColor: token.colorBgLayout,
                backgroundImage: `linear-gradient(${token.colorSplit} 1px, transparent 1px), linear-gradient(90deg, ${token.colorSplit} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                overflow: 'auto',
              }}
            >
              {/* 渲染设施 */}
              {filteredFacilities.map((facility) => (
                <DraggableFacilityCard
                  key={facility.id}
                  facility={facility}
                  onDelete={handleDeleteFacility}
                  onDrop={handleFacilityDrop}
                  onRotate={handleRotateFacility}
                />
              ))}

              {/* 渲染房间 */}
              {filteredRooms?.map((room: API.Room) => {
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
                    onDrop={handleRoomDrop}
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
