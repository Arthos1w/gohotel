import React from 'react';
import { Card, Button, Popconfirm } from 'antd';
import { DeleteOutlined, ColumnWidthOutlined } from '@ant-design/icons';
import { useDrag } from 'react-dnd';
import Iconfont, { IconName } from '@/components/Iconfont';

// 设施类型定义
export const FacilityTypes = {
  ELEVATOR: 'elevator',        // 电梯井
  CORRIDOR: 'corridor',        // 走廊
  LAUNDRY: 'laundry',          // 洗衣房
  STAIRS: 'stairs',            // 楼梯
  BATHROOM: 'bathroom',        // 公共卫生间
  STORAGE: 'storage',          // 储物间
  REST: 'rest',                // 休息区
  RECEPTION: 'reception',      // 前台
  BED: 'bed',                  // 床位区
  MICROWAVE: 'microwave',      // 微波炉/餐饮区
} as const;

export type FacilityType = typeof FacilityTypes[keyof typeof FacilityTypes];

// 设施配置
export const FacilityConfig: Record<FacilityType, {
  name: string;
  icon: IconName;
  color: string;
  bgColor: string;
  defaultWidth: number;
  defaultHeight: number;
}> = {
  elevator: {
    name: '电梯',
    icon: 'elevator',
    color: '#1890ff',
    bgColor: '#e6f7ff',
    defaultWidth: 80,
    defaultHeight: 80,
  },
  corridor: {
    name: '走廊',
    icon: 'corridor',
    color: '#722ed1',
    bgColor: '#f9f0ff',
    defaultWidth: 200,
    defaultHeight: 60,
  },
  laundry: {
    name: '洗衣房',
    icon: 'laundry',
    color: '#13c2c2',
    bgColor: '#e6fffb',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  stairs: {
    name: '楼梯',
    icon: 'stairs',
    color: '#fa8c16',
    bgColor: '#fff7e6',
    defaultWidth: 80,
    defaultHeight: 120,
  },
  bathroom: {
    name: '卫生间',
    icon: 'bathroom',
    color: '#52c41a',
    bgColor: '#f6ffed',
    defaultWidth: 80,
    defaultHeight: 80,
  },
  storage: {
    name: '储物间',
    icon: 'storage',
    color: '#8c8c8c',
    bgColor: '#fafafa',
    defaultWidth: 80,
    defaultHeight: 80,
  },
  rest: {
    name: '休息区',
    icon: 'rest',
    color: '#eb2f96',
    bgColor: '#fff0f6',
    defaultWidth: 160,
    defaultHeight: 120,
  },
  reception: {
    name: '前台',
    icon: 'reception',
    color: '#faad14',
    bgColor: '#fffbe6',
    defaultWidth: 140,
    defaultHeight: 80,
  },
  bed: {
    name: '床位区',
    icon: 'bed',
    color: '#597ef7',
    bgColor: '#f0f5ff',
    defaultWidth: 100,
    defaultHeight: 80,
  },
  microwave: {
    name: '餐饮区',
    icon: 'microwave',
    color: '#f5222d',
    bgColor: '#fff1f0',
    defaultWidth: 100,
    defaultHeight: 100,
  },
};

export const ItemTypes = {
  ROOM_CARD: 'room_card',
  FACILITY_CARD: 'facility_card',
};

// 设施数据接口
export interface Facility {
  id: string;
  type: FacilityType;
  floor: number;
  left: number;
  top: number;
  width: number;
  height: number;
  rotation?: number; // 旋转角度
  label?: string;    // 自定义标签
}

interface DraggableFacilityCardProps {
  facility: Facility;
  onDelete: (id: string) => void;
  onDrop: (id: string, left: number, top: number) => void;
  onResize?: (id: string, width: number, height: number) => void;
  onRotate?: (id: string) => void;
}

// 网格大小
const GRID_SIZE = 20;

// 对齐到网格
const snapToGrid = (x: number, y: number): [number, number] => {
  const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
  const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;
  return [snappedX, snappedY];
};

const DraggableFacilityCard: React.FC<DraggableFacilityCardProps> = ({
  facility,
  onDelete,
  onDrop,
  onRotate,
}) => {
  const config = FacilityConfig[facility.type];

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.FACILITY_CARD,
      item: { 
        id: facility.id, 
        left: facility.left, 
        top: facility.top,
        type: 'facility',
        facility,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (delta && item.id) {
          const newLeft = item.left + delta.x;
          const newTop = item.top + delta.y;
          const [snappedLeft, snappedTop] = snapToGrid(newLeft, newTop);
          onDrop(item.id, snappedLeft, snappedTop);
        }
      },
    }),
    [facility, onDrop],
  );

  // 使用空图片作为拖动预览
  React.useEffect(() => {
    preview(new Image(), { captureDraggingState: true });
  }, [preview]);

  // 计算图标大小
  const iconSize = Math.min(facility.width, facility.height) > 80 ? 28 : 22;

  return (
    <div
      ref={drag as any}
      style={{
        position: 'absolute',
        left: facility.left,
        top: facility.top,
        width: facility.width,
        height: facility.height,
        opacity: isDragging ? 0.3 : 1,
        cursor: 'move',
      }}
    >
      <Card
        hoverable
        size="small"
        bodyStyle={{
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          overflow: 'hidden',
        }}
        style={{
          height: '100%',
          border: `2px dashed ${config.color}`,
          backgroundColor: config.bgColor,
          borderRadius: 4,
        }}
      >
        <div style={{ 
          textAlign: 'center', 
          width: '100%',
          overflow: 'hidden',
        }}>
          <div style={{ marginBottom: 2 }}>
            <Iconfont 
              name={config.icon} 
              size={iconSize} 
              color={config.color}
            />
          </div>
          <div style={{ 
            fontSize: '11px',
            fontWeight: 'bold',
            color: config.color,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {facility.label || config.name}
          </div>
        </div>

        {/* 悬浮操作按钮 */}
        <div
          className="facility-card-actions"
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            display: 'none',
            gap: 2,
          }}
        >
          {onRotate && (
            <Button
              type="text"
              size="small"
              icon={<ColumnWidthOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onRotate(facility.id);
              }}
              style={{ fontSize: 10, padding: 2, minWidth: 20, height: 20 }}
              title="旋转90°"
            />
          )}
          <Popconfirm
            title="确定要删除这个设施吗？"
            onConfirm={() => onDelete(facility.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 10, padding: 2, minWidth: 20, height: 20 }}
            />
          </Popconfirm>
        </div>
      </Card>

      <style>{`
        .ant-card:hover .facility-card-actions {
          display: flex !important;
        }
      `}</style>
    </div>
  );
};

export default DraggableFacilityCard;
