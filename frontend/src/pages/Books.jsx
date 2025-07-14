import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Typography, Rate, Pagination, Skeleton } from 'antd';

const { Title, Paragraph, Text } = Typography;
const PAGE_SIZE = 20;

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBooks = (pageNum = 1) => {
    setLoading(true);
    fetch(`http://localhost:3000/api/dataImport/books?page=${pageNum}&limit=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        setBooks(data.books);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks(page);
  }, [page]);

  return (
    <div style={{ padding: 32 }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: 16 ,color:'white' }}>Books</Title>
      <Paragraph style={{ textAlign: 'center', fontSize: 20, color: 'white', marginBottom: 32 }}>
        Explore a curated collection of books and resources to boost your learning journey!
      </Paragraph>
      {loading ? (
        <Row gutter={[24, 24]} justify="center">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={idx}>
              <Card
                style={{ borderRadius: 12, minHeight: 420 }}
                cover={<Skeleton.Image style={{ width: '98%', height: 260, borderRadius: 8 }} active />}
              >
                <Skeleton active paragraph={{ rows: 4 }} title={{ width: '80%' }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <>
          <Row gutter={[24, 24]} justify="center">
            {books.map(book => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={book._id}>
                <a
                  href={`https://www.amazon.com/s?k=${encodeURIComponent(book.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    hoverable
                    cover={<img alt={book.name} src={book.image} style={{ height: 260, objectFit: 'cover' }} />}
                    style={{ borderRadius: 12, minHeight: 420 }}
                  >
                    <Title level={4} ellipsis={{ rows: 2 }}>{book.name}</Title>
                    <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 4 }}>
                      <b>Author:</b> {book.author}
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 4 }}>
                      <b>Price:</b> {book.price}
                    </Paragraph>
                    <Paragraph style={{ marginBottom: 4 }}>
                      <b>Release Date:</b> {book.release_date}
                    </Paragraph>
                    <div style={{ marginTop: 8 }}>
                      <Rate allowHalf disabled value={book.rating} style={{ fontSize: 18 }} />
                      <Text style={{ marginLeft: 8 }}>{book.rating}</Text>
                    </div>
                  </Card>
                </a>
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Books; 