import DefaultLayout from "@/Layout/DefaultLayout";
import React, { useEffect, useRef, useState } from "react";
import {
    theme,
    Layout,
    Row,
    Col,
    Space,
    Button,
    Flex,
    Modal,
    Table,
    message,
    Popconfirm,
    Dropdown,
    Form,
    Input,
    DatePicker,
} from "antd";
import Title from "antd/es/skeleton/Title";
import Search from "antd/es/input/Search";
import qs from "qs";
import dayjs from "dayjs";
import {
    MoreOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from "@ant-design/icons";

export default function Homepage({}) {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const title = "Homepage";
    const { Content } = Layout;
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [errors, setErrors] = useState({});
    const [open, setOpen] = useState(false);
    const [titleModal, setTitleModal] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [form] = Form.useForm();
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [initialValues, setInitialValues] = useState({});

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
                `/fetch-data?${qs.stringify(getParams(tableParams))}`
            );

            if (response.status == 200) {
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

    const handleDropdownClick = (key, record) => {
        switch (key) {
            case "edit":
                setOpen(true);
                setLoading(true);
                setTimeout(() => {
                    setLoading(false);
                }, 500);
                setTitleModal("Update Book");
                setIsEditMode(true);
                setInitialValues({
                    ...record,
                    years: dayjs(record.years, 'YYYY')
                });
                break;
            default:
                return;
        }
    };

    const handleSearchChange = (value) => {
        setTableParams({
            ...tableParams,
            page: 1,
            pagination: {
                pageSize: 10,
                current: 1,
            },
            search: value,
        });
    };

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

    const handleCreateBook = () => {
        setOpen(true);
        setTitleModal("Create New Book");
        setInitialValues({});
    };

    const handleDeleteBook = async (record) => {
        setLoading(true);

        try {
            const response = await axios.delete(`/${record.slug}`);

            if (response.status === 200 || response.status === 201) {
                message.success(response.data.message);
                fetchData(); // Refresh the table data
            } else {
                message.error(`Failed to delete book`);
            }
        } catch (error) {
            if (error.response.status === 422) {
                setErrors(error.response.data.errors);
            }
            message.error(`Error: validation failed`);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (values) => {
        setLoading(true);

        const newValues = {
            ...values,
            years: dayjs(values.years).year(),
        };

        try {
            const response = isEditMode
                ? await axios.put(`/${initialValues.slug}`, newValues)
                : await axios.post("/", newValues);

            if (response.status === 200 || response.status === 201) {
                message.success(response.data.message);
                setOpen(false);
                fetchData(); // Refresh the table data
            } else {
                message.error(
                    `Failed to ${isEditMode ? "update" : "create"} book`
                );
            }
        } catch (error) {
            // TODO: Handling error
            if (error.response.status === 422) {
                setErrors(error.response.data.errors);
                message.error(`Error: validation failed`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelModal = () => {
        setErrors({});
        setIsEditMode(false);
        setOpen(false);
    };

    return (
        <DefaultLayout>
            <Content
                style={{
                    margin: "24px 16px 0",
                }}
            >
                <div
                    style={{
                        paddingBlock: 10,
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Row gutter={16} align="top" style={{ padding: "5px" }}>
                        <Col xs={24} sm={12} md={16}>
                            <Title level={4}>Book List</Title>
                        </Col>
                        <Col
                            xs={24}
                            sm={12}
                            md={8}
                            offset={0}
                            style={{ textAlign: "right" }}
                        >
                            <Space direction="vertical">
                                <Button
                                    disabled={loading}
                                    type="primary"
                                    onClick={handleCreateBook}
                                >
                                    <PlusOutlined />
                                    Create New Book
                                </Button>
                                <Search
                                    placeholder="input search text"
                                    allowClear
                                    disabled={loading}
                                    onSearch={handleSearchChange}
                                    style={{ width: "100%" }}
                                />
                            </Space>
                        </Col>
                    </Row>
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
                </div>
            </Content>
            <Modal
                title={titleModal}
                open={open}
                centered
                onCancel={handleCancelModal}
                width={520}
                footer={[
                    <Button
                        key="back"
                        disabled={loading}
                        onClick={handleCancelModal}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        disabled={loading}
                        onClick={() => form.submit()}
                    >
                        {isEditMode ? "Save Changes" : "Submit"}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    name="basic"
                    disabled={loading}
                    initialValues={initialValues}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        validateStatus={errors?.name ? "error" : ""}
                        help={errors?.name}
                        validateTrigger="onBlur"
                        rules={[
                            {
                                required: true,
                                message: "Please input the name!",
                            },
                        ]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>
                    <Form.Item
                        name="author"
                        label="Author"
                        validateStatus={errors?.author ? "error" : ""}
                        help={errors?.author}
                        validateTrigger="onBlur"
                        rules={[
                            {
                                required: true,
                                message: "Please input the author!",
                            },
                        ]}
                    >
                        <Input placeholder="Enter author" />
                    </Form.Item>
                    <Form.Item
                        name="years"
                        label="Year"
                        validateStatus={errors?.years ? "error" : ""}
                        help={errors?.years}
                        validateTrigger="onBlur"
                        rules={[
                            {
                                required: true,
                                message: "Please input the year!",
                            },
                        ]}
                    >
                        <DatePicker style={{ width: "100%" }} picker="year" />
                    </Form.Item>
                </Form>
            </Modal>
        </DefaultLayout>
    );
}
