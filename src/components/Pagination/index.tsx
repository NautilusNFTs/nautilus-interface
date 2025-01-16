import React from 'react';
import { Box, Button } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isDarkTheme: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isDarkTheme }) => {
  const buttonStyle = {
    color: isDarkTheme ? 'white' : 'inherit',
    borderColor: isDarkTheme ? 'white' : 'inherit',
  };

  return (
    <Box display="flex" justifyContent="center" mt={2}>
      <Button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        style={buttonStyle}
        variant="outlined"
      >
        Previous
      </Button>
      <Box mx={2} style={{ color: isDarkTheme ? 'white' : 'inherit' }}>
        Page {currentPage} of {totalPages}
      </Box>
      <Button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        style={buttonStyle}
        variant="outlined"
      >
        Next
      </Button>
    </Box>
  );
};

export default Pagination;
