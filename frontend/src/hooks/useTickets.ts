import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const useTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado de filtros
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [priority, setPriority] = useState('Todas');
  const [agent, setAgent] = useState('Todos');

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado de ordenamiento
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tickets`);
      // Asegurarse de que sea un array
      const data = Array.isArray(res.data) ? res.data : [];
      setTickets(data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Agentes únicos para el filtro
  const uniqueAgents = useMemo(() => {
    const agents = tickets.map(t => t.Agente).filter(Boolean);
    return Array.from(new Set(agents));
  }, [tickets]);

  // Lógica de filtrado
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        (ticket.ID?.toString().toLowerCase().includes(searchLower)) ||
        (ticket.Titulo?.toLowerCase().includes(searchLower)) ||
        (ticket.Cliente?.toLowerCase().includes(searchLower)) ||
        (ticket.Nombre_Cuenta?.toLowerCase().includes(searchLower));
      
      const matchesStatus = status === 'Todos' || ticket.Estado === status;
      
      // Ajuste de prioridad
      const matchesPriority = priority === 'Todas' || (ticket.Prioridad || 'Normal') === priority;
      
      const matchesAgent = agent === 'Todos' || ticket.Agente === agent;

      return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
    });
  }, [tickets, search, status, priority, agent]);

  // Lógica de ordenamiento
  const sortedTickets = useMemo(() => {
    let sortableItems = [...filteredTickets];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTickets, sortConfig]);

  // Lógica de paginación
  const totalResults = sortedTickets.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTickets = sortedTickets.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const pageHandlers = {
    next: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
    prev: () => setCurrentPage(prev => Math.max(prev - 1, 1))
  };

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, priority, agent]);

  return {
    tickets,
    currentTickets,
    uniqueAgents,
    fetchTickets,
    loading,
    filters: {
      search,
      status,
      priority,
      agent
    },
    setFilters: {
      setSearch,
      setStatus,
      setPriority,
      setAgent
    },
    pagination: {
      startIndex,
      itemsPerPage,
      totalResults,
      currentPage,
      totalPages
    },
    pageHandlers,
    sortConfig,
    handleSort
  };
};