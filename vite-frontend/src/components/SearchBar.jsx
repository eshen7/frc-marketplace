import React, { useState, useEffect, useRef } from "react";
import { SearchRounded } from "@mui/icons-material";
import { TextField, Paper, List, ListItem, ListSubheader, Box, Avatar, Typography } from "@mui/material";
import Fuse from "fuse.js";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import ProfilePhoto from "./ProfilePhoto";
import { useData } from '../contexts/DataContext';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const fuseRef = useRef(null);
  const navigate = useNavigate();

  const { users, parts, requests, sales, loadingStates } = useData();

  const fuseOptions = {
    threshold: 0.3,
    keys: [
      { name: "team_name", weight: 2 },
      { name: "team_number", weight: 2 },
      { name: "name", weight: 2 },
    ],
    includeScore: true,
    shouldSort: true,
  };

  useEffect(() => {
    const processSearchData = () => {
      const processedSearchData = [
        ...users.map((user) => ({ ...user, type: "team" })),
        ...parts.map((part) => ({ ...part, type: "part" })),
        ...requests.map((request) => ({ ...request, type: "request" })),
        ...sales.map((sale) => ({ ...sale, type: "sale" })),
      ];

      //console.log("processed search data", processedSearchData);
      fuseRef.current = new Fuse(processedSearchData, fuseOptions);
    };

    if (!Object.values(loadingStates).some(state => state)) {
      processSearchData();
    }
  }, [users, parts, requests, sales, loadingStates]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value || value.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (fuseRef.current) {
      const results = fuseRef.current
        .search(value)
        .slice(0, 8)
        .map((result) => ({
          ...result.item,
          score: result.score,
          type: result.item.type,
        }));

      setSearchResults(results);
      setShowDropdown(true);
    }
  };

  const determineResultType = (item) => {
    if (item.team_number) return "team";
    if (item.part.name) return "request";
    return "unknown";
  };

  const handleResultClick = (item) => {
    switch (item.type) {
      case "team":
        navigate(`/profile/frc/${item.team_number}`, { replace: true });
        break;
      case "part":
        navigate(`/parts/${item.id}`);
        break;
      default:
        console.warn("Unknown result type:", item);
    }
    setShowDropdown(false);
    setSearchTerm("");
  };

  const renderResultItem = (item) => {
    switch (item.type) {
      case "team":
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProfilePhoto
              src={item.profile_photo}
              teamNumber={item.team_number}
              alt={"Team Logo"}
              sx={{ width: 24, height: 24, borderRadius: '50%' }}
            />
            <Box>
              <Typography variant="body1">
                Team {item.team_number} | {item.team_name}
              </Typography>
            </Box>
          </Box>
        );
      case "part":
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={item.image != undefined ? item.image : "/default.png"}
              alt="Part Photo"
              sx={{ width: 24, height: 24 }}
            />
            <Box>
              <Typography variant="body1">{item.name}</Typography>
            </Box>
          </Box>
        );
      default:
        return <Typography>Unknown Result Type</Typography>;
    }
  };

  const groupResultsByType = (results) => {
    return results.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {});
  };

  return (
    <Box ref={searchRef} sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search everything..."
        variant="outlined"
        size="small"
        InputProps={{
          endAdornment: <SearchRounded sx={{ color: 'text.secondary' }} />
        }}
        sx={{ bgcolor: 'white', borderRadius: 2 }}
      />

      {showDropdown && searchTerm.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            width: '100%',
            mt: 1,
            maxHeight: '24rem',
            overflow: 'auto',
            zIndex: 1000
          }}
        >
          {searchResults.length > 0 ? (
            Object.entries(groupResultsByType(searchResults)).map(([type, results]) => (
              <List key={type} sx={{ p: 0 }}>
                <ListSubheader
                  sx={{
                    bgcolor: 'grey.100',
                    lineHeight: '2rem'
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </ListSubheader>
                {results.map((result, index) => (
                  <ListItem
                    key={`${result.type}-${result.id || result.team_number}-${index}`}
                    onClick={() => handleResultClick(result)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'grey.100'
                      }
                    }}
                  >
                    {renderResultItem(result)}
                  </ListItem>
                ))}
              </List>
            ))
          ) : (
            <List>
              <ListItem sx={{ justifyContent: 'center' }}>
                <Typography color="text.secondary">Nothing Found</Typography>
              </ListItem>
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
