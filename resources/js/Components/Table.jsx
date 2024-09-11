import { Dropdown, Flex, message, Popconfirm, Space, Table } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import qs from "qs";
import {
    MoreOutlined,
    DeleteOutlined,
    EditOutlined,
} from "@ant-design/icons";

export default function TableHomepage({ loading, setLoading }) {
    const [data, setData] = useState(null);
    const [errors, setErrors] = useState({});
    const [open, setOpen] = useState(false);
    const [titleModal, setTitleModal] = useState("");
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    useEffect(() => {
        fetchData();
    }, [
        tableParams.pagination?.pageSize,
        tableParams.pagination?.current,
        tableParams?.search,
    ]);

    const getParams = (params) => {
        return {
            results: params.pagination?.pageSize,
            page: params.pagination?.current,
            ...params,
        };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/fetch-data?${qs.stringify(
                    getParams(tableParams)
                )}`
            );

            if (response.status == 200) {
                console.log(response.data)
                setTimeout(() => {
                    setData(response.data.data);
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            pageSize: response.data.per_page,
                            current: response.data.current_page,
                            total: response.data.total,
                        },
                    });
                    setLoading(false);
                }, 500);
            } else {
                message.error(`Error: ${error.message}`);
                setLoading(false);
            }
        } catch (error) {
            // TODO: Handling error
            message.error(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    const columnAction = (text, record) => {
        const actions = [
            {
                key: "edit",
                label: (
                    <Flex gap="middle" vertical={false}>
                        <EditOutlined />
                        Edit
                    </Flex>
                ),
            },
            {
                key: "delete",
                label: (
                    <Popconfirm
                        title="Delete book"
                        description="Are you sure to delete this book ?"
                        onConfirm={() => handleDeleteBook(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Flex gap="middle" vertical={false}>
                            <DeleteOutlined />
                            Delete
                        </Flex>
                    </Popconfirm>
                ),
            },
        ];

        return (
            <Dropdown
                placement="topLeft"
                menu={{
                    items: actions,
                    onClick: ({ key }) => handleDropdownClick(key, record),
                }}
                trigger={["hover"]}
            >
                <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        <MoreOutlined />
                    </Space>
                </a>
            </Dropdown>
        );
    };

    const columns = [
        {
            title: "Date Created",
            dataIndex: "created_at",
            width: 100,
        },
        {
            title: "Name",
            dataIndex: "name",
            width: 100,
        },
        {
            title: "Author",
            dataIndex: "author",
            width: 50,
        },
        {
            title: "Year",
            dataIndex: "years",
            width: 200,
        },
        {
            title: "",
            key: "operation",
            fixed: "right",
            align: "right",
            width: 20,
            render: columnAction,
        },
    ];

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            date: tableParams.date,
            dimension: tableParams.dimension,
            search: tableParams.search,
        });

        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    };

    return (
        <Table
            dataSource={data}
            rowKey={(record) => record.id}
            columns={columns}
            pagination={tableParams.pagination}
            scroll={{ x: "max-content", y: 420 }}
            loading={loading}
            size="small"
            onChange={handleTableChange}
        />
    );
}
