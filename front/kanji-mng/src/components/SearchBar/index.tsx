import {InputAdornment, TextField} from "@mui/material";
import {Search} from "@mui/icons-material";
import {Main} from "./styles";

export default function SearchBar({ handleSearch }: { handleSearch: React.FormEventHandler<HTMLFormElement> }) {
  return (
      <Main>
        <form onSubmit={handleSearch}>
          <TextField
            id="outlined-search"
            label="Search"
            type="search"
            sx={{ width: '100%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Main>
  )
};
