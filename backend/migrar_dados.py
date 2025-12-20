import os
import pandas as pd
from sqlalchemy import create_engine
import urllib
import sys

# =========================================================
# Configurações via variáveis de ambiente (não versionar segredos!)
# =========================================================
# SQL Server (Origem)
SQLSERVER_HOST = os.environ.get("SQLSERVER_HOST", "")
SQLSERVER_DB = os.environ.get("SQLSERVER_DB", "")
SQLSERVER_USER = os.environ.get("SQLSERVER_USER", "")
SQLSERVER_PASSWORD = os.environ.get("SQLSERVER_PASSWORD", "")

# Postgres (Destino)
POSTGRES_URL = os.environ.get("POSTGRES_URL", "")  # ex: postgresql://user:pass@db:5432/dataPanelEng

if __name__ == "__main__":
    missing = []
    for k, v in {
        "SQLSERVER_HOST": SQLSERVER_HOST,
        "SQLSERVER_DB": SQLSERVER_DB,
        "SQLSERVER_USER": SQLSERVER_USER,
        "SQLSERVER_PASSWORD": SQLSERVER_PASSWORD,
        "POSTGRES_URL": POSTGRES_URL,
    }.items():
        if not v:
            missing.append(k)

    if missing:
        print("Erro: variáveis de ambiente ausentes para migração:", ", ".join(missing))
        print("Dica: crie um backend/.env (apenas local) baseado em backend/.env.example e exporte as variáveis.")
        sys.exit(1)

# Mapeamento de Tabelas e Colunas Identificadas pelo Mestre
# Adicionei a D_E_L_E_T_ em todas para manter a integridade dos seus filtros SQL
TABELAS_COLUNAS = {
    "SC5010": ["C5_NUM", "C5_DATACLI", "C5_EMISSAO", "C5_CLIENTE", "C5_LOJAENT", "C5_PEDCLI", "C5_MOEDA", "C5_CONDPAG", "C5_TIPOCLI", "C5_NOMECLI", "C5_NUMORC", "C5_GEROP", "C5_DBUSLIB", "C5_DBHOLIB", "C5_DBDTLIB", "C5_NOTA", "D_E_L_E_T_"],
    "SC6010": ["C6_NUM", "C6_ITEM", "C6_PRODUTO", "C6_DESCRI", "C6_DESTINO", "C6_QTDVEN", "C6_PRCVEN", "C6_VALOR", "C6_TES", "C6_PRZCLIE", "C6_NUMORC", "C6_ENTREG", "C6_ACBBRAS", "D_E_L_E_T_"],
    "SCJ010": ["CJ_NUM", "CJ_USERLGI", "CJ_USERLGA", "CJ_EMISSAO", "CJ_DATACLI", "CJ_STATUS", "CJ_LIBERAD", "CJ_NOME", "CJ_XDESENV", "CJ_TIPORC2", "CJ_TPORC", "CJ_XTPAPN", "CJ_MOTIVOA", "CJ_XMOTATR", "CJ_OBSENC", "CJ_OBS", "CJ_XOBSCA1", "CJ_CONDPAG", "CJ_MOEDA", "CJ_TXEURO", "CJ_TOTAL", "D_E_L_E_T_"],
    "SCK010": ["CK_NUM", "CK_ITEM", "CK_PRODUTO", "CK_CLIENTE", "CK_LOJA", "CK_DESCRI", "CK_COMDESC", "CK_CLASSE", "CK_ACLASSE", "CK_PRCVEN", "CK_VALOR", "CK_QTDVEN", "CK_PRAZOCL", "CK_UM", "CK_PCEURO", "CK_XEUROKG", "CK_MARGEM", "CK_ORIGEM", "D_E_L_E_T_"],
    "SB1010": ["B1_COD", "B1_DESC", "B1_POSIPI", "B1_DESENHO", "B1_DCLASSE", "B1_ACLASSE", "B1_PESOMD", "D_E_L_E_T_"],
    "SA1010": ["A1_COD", "A1_LOJA", "A1_CGC", "A1_NOME", "A1_EST", "A1_PAIS", "A1_VEND", "A1_COMIS", "A1_NREDUZ", "A1_DRTLOGR", "A1_NUMERO", "A1_COMPLEM", "A1_END", "A1_MUN", "A1_BAIRRO", "A1_CEP", "A1_ENDCOB", "A1_BAIRROC", "A1_CEPC", "A1_MUNC", "A1_ENDENT", "A1_ENDREC", "D_E_L_E_T_"],
    "SC1010": ["C1_NUM", "C1_SOLICIT", "C1_XPEDVEN", "C1_EMISSAO", "C1_OP", "D_E_L_E_T_"],
    "SC2010": ["C2_NUM", "C2_ITEM", "C2_PRODUTO", "C2_EMISSAO", "C2_QUANT", "D_E_L_E_T_"],
    "SC7010": ["C7_NUM", "C7_EMISSAO", "C7_FORNECE", "C7_PRODUTO", "C7_NUMSC", "C7_APROV", "C7_CONAPRO", "C7_XPEDVEN", "D_E_L_E_T_"],
    "SB8010": ["B8_PRODUTO", "B8_SALDO", "B8_LOCAL", "D_E_L_E_T_"],
    "SH6010": ["H6_DESCREC", "H6_OP", "D_E_L_E_T_"],
    "SYS_USR": ["USR_ID", "USR_CODIGO"] # Tabela de sistema geralmente não tem D_E_L_E_T_
}

def conectar_mssql():
    params = urllib.parse.quote_plus(
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={SERVER};"
        f"DATABASE={DATABASE};"
        f"UID={USER};"
        f"PWD={PASSWORD};"
        f"Connect Timeout=60;"
    )
    return create_engine(f"mssql+pyodbc:///?odbc_connect={params}")

def migrar():
    try:
        engine_mssql = conectar_mssql()
        engine_pg = create_engine(POSTGRES_URL)
        
        print(f"🚀 Iniciando migração seletiva para o Mestre...\n")

        for tabela, colunas in TABELAS_COLUNAS.items():
            print(f"📦 Extraindo {tabela}...", end="\r")
            
            # Constrói a query apenas com as colunas necessárias
            colunas_formatadas = ", ".join(colunas)
            query = f"SELECT {colunas_formatadas} FROM {tabela}"
            
            # Lendo os dados
            df = pd.read_sql(query, engine_mssql)
            
            # Gravando no Postgres (lower case para seguir padrão Linux/Postgres)
            df.to_sql(tabela.lower(), engine_pg, if_exists='replace', index=False)
            
            print(f"✅ Tabela {tabela.lower()} migrada: {len(df)} registros e {len(colunas)} colunas.")

        print(f"\n✨ Missão cumprida, Mestre! O ambiente está pronto.")

    except Exception as e:
        print(f"\n❌ Erro durante a migração: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrar()