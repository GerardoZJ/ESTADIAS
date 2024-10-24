import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Nav = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/Login');
    };

    return (
        <nav>
            <ul>
                <li><Link to="/Catalogo">Catálogo</Link></li>
                {token ? (
                    <>
                        <li><Link to="/Crear">Agregar Material</Link></li>
                        <li><button onClick={handleLogout}>Cerrar Sesión</button></li>
                    </>
                ) : (
                    <li><Link to="/Login">Iniciar Sesión</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Nav;
