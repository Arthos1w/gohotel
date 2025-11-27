import { AppstoreAddOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ModalForm } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Divider,
  message,
  Row,
  Space,
  Alert,
  Typography,
  Tag,
  Input,
  InputNumber,
  Select,
  Form,
} from 'antd';
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

const roomTypeOptions = [
  { label: '单人间', value: '单人间' },
  { label: '双人间', value: '双人间' },
  { label: '豪华套房', value: '豪华套房' },
  { label: '总统套房', value: '总统套房' },
  { label: '商务套房', value: '商务套房' },
];

const bedTypeOptions = [
  { label: '单人床', value: '单人床' },
  { label: '双人床', value: '双人床' },
  { label: '大床', value: '大床' },
  { label: '两张单人床', value: '两张单人床' },
];

const BatchCreateForm: FC<BatchCreateFormProps> = (props) => {
  const { reload } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<RoomFormData[]>([{ key: '1' }]);
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
    setRooms(rooms.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
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

  // 验证单个房间
  const validateRoom = (room: RoomFormData): string | null => {
    if (!room.room_number) return '房间号不能为空';
    if (!room.room_type) return '房型不能为空';
    if (!room.floor || room.floor < 1) return '楼层不能为空';
    if (!room.price || room.price <= 0) return '价格必须大于0';
    if (!room.capacity || room.capacity < 1) return '可住人数不能为空';
    return null;
  };

  // 提交
  const handleSubmit = async () => {
    // 验证所有房间
    const validRooms: API.CreateRoomRequest[] = [];
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const error = validateRoom(room);
      if (error) {
        messageApi.error(`房间 ${i + 1} (${room.room_number || '未填写房间号'}): ${error}`);
        return false;
      }
      validRooms.push({
        room_number: room.room_number!,
        room_type: room.room_type!,
        floor: room.floor!,
        price: room.price!,
        original_price: room.original_price,
        capacity: room.capacity!,
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

  // 检查字段是否有效
  const isFieldInvalid = (room: RoomFormData, field: keyof RoomFormData) => {
    if (field === 'room_number') return !room.room_number;
    if (field === 'room_type') return !room.room_type;
    if (field === 'floor') return !room.floor || room.floor < 1;
    if (field === 'price') return !room.price || room.price <= 0;
    if (field === 'capacity') return !room.capacity || room.capacity < 1;
    return false;
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
        {result && result.failed_count && result.failed_count > 0 && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message={`${result.failed_count} 个房间创建失败`}
            description={
              <div>
                {result.failed_rooms?.map((item, index) => (
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
                  <Form.Item
                    label="房间号"
                    required
                    validateStatus={isFieldInvalid(room, 'room_number') ? 'error' : ''}
                    help={isFieldInvalid(room, 'room_number') ? '必填' : ''}
                  >
                    <Input
                      value={room.room_number}
                      onChange={(e) => updateRoom(room.key, 'room_number', e.target.value)}
                      placeholder="如: 101"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="房型"
                    required
                    validateStatus={isFieldInvalid(room, 'room_type') ? 'error' : ''}
                    help={isFieldInvalid(room, 'room_type') ? '必填' : ''}
                  >
                    <Select
                      value={room.room_type}
                      onChange={(v) => updateRoom(room.key, 'room_type', v)}
                      options={roomTypeOptions}
                      placeholder="选择房型"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="楼层"
                    required
                    validateStatus={isFieldInvalid(room, 'floor') ? 'error' : ''}
                    help={isFieldInvalid(room, 'floor') ? '必填' : ''}
                  >
                    <InputNumber
                      value={room.floor}
                      onChange={(v) => updateRoom(room.key, 'floor', v)}
                      min={1}
                      max={100}
                      precision={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="价格"
                    required
                    validateStatus={isFieldInvalid(room, 'price') ? 'error' : ''}
                    help={isFieldInvalid(room, 'price') ? '必填' : ''}
                  >
                    <InputNumber
                      value={room.price}
                      onChange={(v) => updateRoom(room.key, 'price', v)}
                      min={0}
                      precision={2}
                      addonBefore="¥"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="可住人数"
                    required
                    validateStatus={isFieldInvalid(room, 'capacity') ? 'error' : ''}
                    help={isFieldInvalid(room, 'capacity') ? '必填' : ''}
                  >
                    <InputNumber
                      value={room.capacity}
                      onChange={(v) => updateRoom(room.key, 'capacity', v)}
                      min={1}
                      max={10}
                      precision={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="面积(m²)">
                    <InputNumber
                      value={room.area}
                      onChange={(v) => updateRoom(room.key, 'area', v)}
                      min={0}
                      precision={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="床型">
                    <Select
                      value={room.bed_type}
                      onChange={(v) => updateRoom(room.key, 'bed_type', v)}
                      options={bedTypeOptions}
                      placeholder="选择床型"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="原价">
                    <InputNumber
                      value={room.original_price}
                      onChange={(v) => updateRoom(room.key, 'original_price', v)}
                      min={0}
                      precision={2}
                      addonBefore="¥"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
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
