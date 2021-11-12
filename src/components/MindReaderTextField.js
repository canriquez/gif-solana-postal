import { withTheme } from '@emotion/react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

const MindReaderTextField = styled(TextField)({
  '& label': {
    color: 'white',
    fontSize: '20px'
  },
  '& label.Mui-focused': {
    color: 'white',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'white',
  },
  '& .MuiInput-underline:before': {
    borderBottomColor: 'white',
  },
  '& .MuiInputBase-inputTypeSearch': {
    color: 'white',
    fontSize: '24px'
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'red',
    },
    '&:hover fieldset': {
      borderColor: 'yellow',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
});

export default MindReaderTextField;