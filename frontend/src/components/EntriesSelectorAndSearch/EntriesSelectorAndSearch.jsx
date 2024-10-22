/* eslint-disable react/prop-types */
import { Form, InputGroup, FormControl, Row, Col } from "react-bootstrap";
import "./entriesSelectorAndSearch.css";
const EntriesSelectorAndSearch = ({
  entriesToShow,
  setEntriesToShow,
  filter,
  setFilter,
  setCurrentPage,
}) => {
  const handleEntriesChange = (e) => {
    setEntriesToShow(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when changing entries to show
  };

  return (
    <Row
      id="search-bar-and-filter"
      className="mb-3 d-flex justify-content-between print-not-show"
    >
      <Col md={4} className="my-2">
        <Form.Group
          controlId="entriesToShow"
          className="entries-selector-group d-flex align-items-center g-2"
        >
          <span>Show</span>
          <Form.Control
            as="select"
            value={entriesToShow}
            onChange={handleEntriesChange}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Control>
          <span>entries</span>
        </Form.Group>
      </Col>

      <Col md={4} className="text-right my-2">
        <InputGroup>
          <FormControl
            placeholder="Search here..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </InputGroup>
      </Col>
    </Row>
  );
};

export default EntriesSelectorAndSearch;
