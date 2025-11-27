import { AppstoreAddOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { Button, Card, Col, Divider, message, Row, Space, Alert, Typography, Tag } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { postRoomsBatch } from '@/services/api/guanliyuan';

const { Text } = Typography;

interface BatchCreateFormProps {
  reload?: ActionType['reload'];
}

interface RoomFormData {
  key: string;
  room_number?: string;
  room_type?: string;
  floor?: number;
  price?: number;
  original_price?: number;
  capacity?: number;
  area?: number;
  bed_type?: string;
}

const roomTypeOptions = {
  '单人间': '单人间',
  '双人间': '双人间',
  '豪华套房': '豪华套房',
  '总统套房': '总统套房',
  '商务套房': '商务套房',
};

const bedTypeOptions = {
  '单人床': '单人床',
  '双人床': '双人床',
  '大床': '大床',
  '两张单人床': '两张单人床',
};

const BatchCreateForm: FC<BatchCreateFormProps> = (props) => {
  const { reload } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<RoomFormData[]>([
    { key: '1' },
  ]);
  const [result, setResult] = useState<API.BatchCreateRoomsResult | null>(null);

  // 生成唯一 key
  const generateKey = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // 添加房间
  const addRoom = () => {
    if (rooms.length >= 100) {
      messageApi.warning('单次最多创建100个房间');
      return;
    }
    setRooms([...rooms, { key: generateKey() }]);
  };

  // 删除房间
  const removeRoom = (key: string) => {
    if (rooms.length <= 1) {
      messageApi.warning('至少保留一个房间');
      return;
    }
    setRooms(rooms.filter((r) => r.key !== key));
  };

  // 更新房间数据
  const updateRoom = (key: string, field: string, value: any) => {
    setRooms(
      rooms.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    );
  };

  // 快速批量添加
  const quickAddRooms = (count: number, floor: number, roomType: string, startNumber: number) => {
    const newRooms: RoomFormData[] = [];
    for (let i = 0; i < count; i++) {
      const roomNumber = `${floor}${String(startNumber + i).padStart(2, '0')}`;
      newRooms.push({
        key: generateKey(),
        room_number: roomNumber,
        room_type: roomType,
        floor: floor,
        capacity: roomType === '单人间' ? 1 : 2,
        price: roomType === '单人间' ? 199 : roomType === '双人间' ? 299 : 499,
      });
    }
    if (rooms.length + newRooms.length > 100) {
      messageApi.warning('房间总数不能超过100个');
      return;
    }
    setRooms([...rooms, ...newRooms]);
  };

  // 提交
  const handleSubmit = async () => {
    // 验证
    const validRooms: API.CreateRoomRequest[] = [];
    for (const room of rooms) {
      if (!room.room_number || !room.room_type || !room.floor || !room.price || !room.capacity) {
        messageApi.error(`房间 ${room.room_number || '(未填写房间号)'} 信息不完整`);
        return false;
      }
      validRooms.push({
        room_number: room.room_number,
        room_type: room.room_type,
        floor: room.floor,
        price: room.price,
        original_price: room.original_price,
        capacity: room.capacity,
        area: room.area,
        bed_type: room.bed_type,
      });
    }

    setLoading(true);
    try {
      const response = await postRoomsBatch({ rooms: validRooms });
      const data = (response as any)?.data || response;
      setResult(data);
      
      if (data.success_count > 0) {
        messageApi.success(`成功创建 ${data.success_count} 个房间`);
        if (data.failed_count === 0) {
          // 全部成功，清空并关闭
          setRooms([{ key: generateKey() }]);
          setResult(null);
          if (reload) reload();
          return true;
        }
      }
      
      if (data.failed_count > 0) {
        messageApi.warning(`${data.failed_count} 个房间创建失败`);
      }
      
      if (reload) reload();
      return false; // 有失败的，不关闭弹窗
    } catch (error) {
      messageApi.error('批量创建失败，请重试');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <ModalForm
        title="批量创建房间"
        trigger={
          <Button icon={<AppstoreAddOutlined />}>
            批量新建
          </Button>
        }
        width={900}
        modalProps={{
          destroyOnClose: true,
          okButtonProps: { loading },
        }}
        onOpenChange={(open) => {
          if (!open) {
            setRooms([{ key: generateKey() }]);
            setResult(null);
          }
        }}
        submitter={{
          searchConfig: {
            submitText: `确认创建 (${rooms.length}个)`,
          },
        }}
        onFinish={handleSubmit}
      >
        {/* 快捷操作区 */}
        <Card size="small" title="快捷批量添加" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Button size="small" onClick={() => quickAddRooms(5, 1, '单人间', 1)}>
              1楼5间单人间
            </Button>
            <Button size="small" onClick={() => quickAddRooms(5, 2, '双人间', 1)}>
              2楼5间双人间
            </Button>
            <Button size="small" onClick={() => quickAddRooms(3, 3, '豪华套房', 1)}>
              3楼3间豪华套房
            </Button>
            <Button size="small" onClick={() => quickAddRooms(10, 1, '双人间', 1)}>
              1楼10间双人间
            </Button>
          </Space>
        </Card>

        {/* 结果展示 */}
        {result && result.failed_count > 0 && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message={`${result.failed_count} 个房间创建失败`}
            description={
              <div>
                {result.failed_rooms.map((item, index) => (
                  <div key={index}>
                    <Tag color="red">{item.room_number}</Tag>
                    <Text type="secondary">{item.reason}</Text>
                  </div>
                ))}
              </div>
            }
          />
        )}

        {/* 房间列表 */}
        <div style={{ maxHeight: 450, overflowY: 'auto' }}>
          {rooms.map((room, index) => (
            <Card
              key={room.key}
              size="small"
              title={`房间 ${index + 1}`}
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeRoom(room.key)}
                  disabled={rooms.length <= 1}
                />
              }
              style={{ marginBottom: 12 }}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <ProFormText
                    name={`room_${room.key}_number`}
                    label="房间号"
                    rules={[{ required: true, message: '必填' }]}
                    fieldProps={{
                      value: room.room_number,
                      onChange: (e) => updateRoom(room.key, 'room_number', e.target.value),
                    }}
                    placeholder="如: 101"
                  />
                </Col>
                <Col span={6}>
                  <ProFormSelect
                    name={`room_${room.key}_type`}
                    label="房型"
                    rules={[{ required: true, message: '必填' }]}
                    valueEnum={roomTypeOptions}
                    fieldProps={{
                      value: room.room_type,
                      onChange: (v) => updateRoom(room.key, 'room_type', v),
                    }}
                    placeholder="选择房型"
                  />
                </Col>
                <Col span={6}>
                  <ProFormDigit
                    name={`room_${room.key}_floor`}
                    label="楼层"
                    rules={[{ required: true, message: '必填' }]}
                    min={1}
                    max={100}
                    fieldProps={{
                      precision: 0,
                      value: room.floor,
                      onChange: (v) => updateRoom(room.key, 'floor', v),
                    }}
                  />
                </Col>
                <Col span={6}>
                  <ProFormDigit
                    name={`room_${room.key}_price`}
                    label="价格"
                    rules={[{ required: true, message: '必填' }]}
                    min={0}
                    fieldProps={{
                      precision: 2,
                      addonBefore: '¥',
                      value: room.price,
                      onChange: (v) => updateRoom(room.key, 'price', v),
                    }}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <ProFormDigit
                    name={`room_${room.key}_capacity`}
                    label="可住人数"
                    rules={[{ required: true, message: '必填' }]}
                    min={1}
                    max={10}
                    fieldProps={{
                      precision: 0,
                      value: room.capacity,
                      onChange: (v) => updateRoom(room.key, 'capacity', v),
                    }}
                  />
                </Col>
                <Col span={6}>
                  <ProFormDigit
                    name={`room_${room.key}_area`}
                    label="面积(m²)"
                    min={0}
                    fieldProps={{
                      precision: 1,
                      value: room.area,
                      onChange: (v) => updateRoom(room.key, 'area', v),
                    }}
                  />
                </Col>
                <Col span={6}>
                  <ProFormSelect
                    name={`room_${room.key}_bed`}
                    label="床型"
                    valueEnum={bedTypeOptions}
                    fieldProps={{
                      value: room.bed_type,
                      onChange: (v) => updateRoom(room.key, 'bed_type', v),
                    }}
                  />
                </Col>
                <Col span={6}>
                  <ProFormDigit
                    name={`room_${room.key}_original_price`}
                    label="原价"
                    min={0}
                    fieldProps={{
                      precision: 2,
                      addonBefore: '¥',
                      value: room.original_price,
                      onChange: (v) => updateRoom(room.key, 'original_price', v),
                    }}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </div>

        <Divider />

        <Button
          type="dashed"
          onClick={addRoom}
          block
          icon={<PlusOutlined />}
          disabled={rooms.length >= 100}
        >
          添加房间 ({rooms.length}/100)
        </Button>
      </ModalForm>
    </>
  );
};

export default BatchCreateForm;

