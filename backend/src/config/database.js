import neo4j from 'neo4j-driver';
import 'dotenv/config';

const { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD } = process.env;

if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASSWORD) {
  throw new Error(
    '❌ Faltan variables de entorno de Neo4j. Revisa tu archivo .env (NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD).'
  );
}

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

/**
 * Verifica la conectividad con la base de datos Neo4j.
 * Lanza un error si la conexión falla.
 */
export const verifyConnectivity = async () => {
  try {
    await driver.verifyConnectivity();
    console.log('✅ Conexión a Neo4j establecida correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar con Neo4j:', error.message);
    throw error;
  }
};

export default driver;
