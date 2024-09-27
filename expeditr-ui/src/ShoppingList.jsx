import React from 'react';
import styled from 'styled-components';

const ListWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const CategorySection = styled.div`
  margin-bottom: 1rem;
`;

const CategoryHeader = styled.h3`
  background-color: #4A5568;
  color: white;
  padding: 0.5rem;
  border-radius: 4px 4px 0 0;
  margin: 0;
`;

const ItemList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  background-color: white;
  border: 1px solid #4A5568;
  border-top: none;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #E2E8F0;

  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.input`
  margin-right: 1rem;
`;

const ShoppingList = ({ items }) => (
  <ListWrapper>
    <h2>Shopping List</h2>
    {Object.entries(items).map(([category, categoryItems]) => (
      <CategorySection key={category}>
        <CategoryHeader>{category}</CategoryHeader>
        <ItemList>
          {categoryItems.map((item, index) => (
            <ListItem key={index}>
              <Checkbox type="checkbox" id={`item-${index}`} />
              <label htmlFor={`item-${index}`}>{item.name} - {item.amount}</label>
            </ListItem>
          ))}
        </ItemList>
      </CategorySection>
    ))}
  </ListWrapper>
);

export default ShoppingList;