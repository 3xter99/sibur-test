import React, { useEffect, useState, ChangeEvent, useCallback } from 'react';
import axios from 'axios';
import {
    Box,
    TextField,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Avatar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { debounce } from 'lodash';

interface User {
    id: number;
    gender: string;
    date_of_birth: string;
    job: string;
    city: string;
    zipcode: string;
    latitude: number;
    profile_picture: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    street: string;
    state: string;
    country: string;
    longitude: number;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
    const [search, setSearch] = useState<string>('');
    const [offset, setOffset] = useState<number>(0);
    const [limit, setLimit] = useState<number>(10);

    const fetchUsers = (searchTerm: string, offset: number) => {
        axios.get('https://api.slingacademy.com/v1/sample-data/users', {
            params: {
                search: searchTerm,
                offset: offset,
                limit: limit,
            },
        })
            .then(response => {
                if (offset === 0) {
                    setUsers(response.data.users);
                } else {
                    setUsers(prevState => [...prevState, ...response.data.users]);
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    const debouncedFetchUsers = useCallback(
        debounce((searchTerm: string, offset: number) => {
            fetchUsers(searchTerm, offset);
        }, 300), []
    );

    useEffect(() => {
        debouncedFetchUsers(search, offset);
    }, [search, offset, debouncedFetchUsers]);

    const handleExpandClick = (id: number) => {
        setExpanded(prevExpanded => ({
            ...prevExpanded,
            [id]: !prevExpanded[id],
        }));
    };

    const handleCollapseAll = () => {
        setExpanded({});
    };

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        setOffset(0);
    };

    const handleLoadMore = () => {
        setOffset(prevOffset => prevOffset + limit);
    };

    return (
        <>
            <Box sx={{ p: 2, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Пользователи</Typography>
                <Box sx={{ p: 2, pt: 0, pb: 0, display: 'flex', alignItems: 'center' }}>
                    <TextField
                        label="Поиск..."
                        variant="outlined"
                        value={search}
                        onChange={handleSearchChange}
                        sx={{ flexGrow: 1, mr: 2 }}
                    />
                    <Button sx={{ height: '56px' }}  variant="contained" onClick={handleCollapseAll}>
                        Свернуть всех
                    </Button>
                </Box>
            </Box>
            <Box sx={{ p: 2, maxHeight: 'calc(100vh - 72px)', overflow: 'auto' }}>
                {users.map(user => (
                    <Accordion
                        key={user.id}
                        expanded={!!expanded[user.id]}
                        onChange={() => handleExpandClick(user.id)}
                    >
                        <AccordionSummary
                            expandIcon={expanded[user.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            aria-controls={`panel-${user.id}-content`}
                            id={`panel-${user.id}-header`}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Box>
                                    <Typography variant="h6">{user.first_name} {user.last_name} ({user.job})</Typography>
                                    <Typography variant="body2">{user.email}</Typography>
                                </Box>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', alignItems: 'start', width: '100%' }}>
                                <Avatar src={user.profile_picture} alt={user.first_name} sx={{ width: 72, height: 72, mr: 2 }} />
                                <Box>
                                    <Typography variant="body2">ID: {user.id}</Typography>
                                    <Typography variant="body2">Пол: {user.gender}</Typography>
                                    <Typography variant="body2">Дата рождения: {user.date_of_birth}</Typography>
                                    <Typography variant="body2">Работа: {user.job}</Typography>
                                    <Typography variant="body2">Город: {user.city}</Typography>
                                    <Typography variant="body2">Индекс: {user.zipcode}</Typography>
                                    <Typography variant="body2">Координаты: {`Широта: ${user.latitude}, Долгота: ${user.longitude}`}</Typography>
                                    <Typography variant="body2">Телефон: {user.phone}</Typography>
                                    <Typography variant="body2">Улица: {user.street}</Typography>
                                    <Typography variant="body2">Штат: {user.state}</Typography>
                                    <Typography variant="body2">Страна: {user.country}</Typography>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
                <Button variant="contained" onClick={handleLoadMore} sx={{ mt: 2 }}>
                    Загрузить больше
                </Button>
            </Box>
        </>
    );
};

export default UserList;
