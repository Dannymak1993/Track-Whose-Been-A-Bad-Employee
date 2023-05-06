SELECT role.id, role.title, department.name AS department, role.salary
FROM role
INNER JOIN department ON role.department_id = department.id;

SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
LEFT JOIN employee manager ON employee.manager_id = manager.id;