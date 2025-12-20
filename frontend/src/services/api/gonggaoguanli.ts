// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 获取所有公告 获取所有公告，支持分页 GET /api/admin/notices */
export async function getAdminNotices(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAdminNoticesParams,
  options?: { [key: string]: any }
) {
  return request<Record<string, any>>("/api/admin/notices", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建公告 创建新的公告 POST /api/admin/notices */
export async function postAdminNotices(
  body: {
    /** 公告标题 */
    title: string;
    /** 点击跳转链接 */
    link_url?: string;
    /** 展示顺序 */
    sort?: number;
    /** 公告开始时间 */
    start_time?: string;
    /** 公告结束时间 */
    end_time?: string;
  },
  options?: { [key: string]: any }
) {
  const formData = new FormData();

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === "object" && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ""));
        } else {
          formData.append(
            ele,
            new Blob([JSON.stringify(item)], { type: "application/json" })
          );
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.Notice>("/api/admin/notices", {
    method: "POST",
    data: formData,
    requestType: "form",
    ...(options || {}),
  });
}

/** 根据ID获取公告 根据ID获取公告详情 GET /api/admin/notices/${param0} */
export async function getAdminNoticesId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAdminNoticesIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Notice>(`/api/admin/notices/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新公告 更新公告信息 POST /api/admin/notices/${param0} */
export async function postAdminNoticesId(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.postAdminNoticesIdParams,
  body: {
    /** 公告标题 */
    title?: string;
    /** 点击跳转链接 */
    link_url?: string;
    /** 展示顺序 */
    sort?: number;
    /** 公告开始时间 */
    start_time?: string;
    /** 公告结束时间 */
    end_time?: string;
  },
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  const formData = new FormData();

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === "object" && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ""));
        } else {
          formData.append(
            ele,
            new Blob([JSON.stringify(item)], { type: "application/json" })
          );
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.Notice>(`/api/admin/notices/${param0}`, {
    method: "POST",
    params: { ...queryParams },
    data: formData,
    requestType: "form",
    ...(options || {}),
  });
}

/** 获取激活的公告 获取激活状态的公告，用于前端展示 GET /api/notices/active */
export async function getNoticesActive(options?: { [key: string]: any }) {
  return request<API.Notice[]>("/api/notices/active", {
    method: "GET",
    ...(options || {}),
  });
}
