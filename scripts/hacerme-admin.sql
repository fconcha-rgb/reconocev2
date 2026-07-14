update profiles set
  role = 'admin',
  first_name = 'Francisco',        -- edita si corresponde
  last_name = 'Concha',            -- edita si corresponde
  display_name = 'Francisco Concha', -- edita si corresponde
  job_title = 'Administrador',     -- edita: tu cargo real
  area = 'Sell In'                 -- edita: tu área real
where email = 'fconcha@falabella.cl';

-- Verifica que quedó correcto:
select id, email, display_name, role, status from profiles where email = 'fconcha@falabella.cl';
