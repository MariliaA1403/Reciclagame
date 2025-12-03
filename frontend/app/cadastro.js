// app/Cadastro.js
import { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Image, ScrollView, Alert, Pressable 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const API_URL = "https://backend-reciclagame.vercel.app";

export default function Cadastro() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados Instituição
  const [institutionName, setInstitutionName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [institutionPhone, setInstitutionPhone] = useState('');
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutionPassword, setInstitutionPassword] = useState('');
  const [institutionConfirmPassword, setInstitutionConfirmPassword] = useState('');

  // Estados Jogador
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  

  // Lista de instituições para o Picker
  const [instituicoesList, setInstituicoesList] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/instituicoes`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setInstituicoesList(data.instituicoes);
      })
      .catch(err => console.log(err));
  }, []);

  const handleRegister = async () => {
    setErrorMessage('');
    if (!selectedType) {
      setErrorMessage("Selecione se você é instituição ou jogador.");
      return;
    }

    let body = {};
    let camposFaltando = [];

    if (selectedType === "jogador") {
      if (!userName) camposFaltando.push("Nome");
      if (!userEmail) camposFaltando.push("Email");
      if (!matricula) camposFaltando.push("Matrícula");
      if (!birthDate) camposFaltando.push("Data de Nascimento");
      if (!phone) camposFaltando.push("Telefone");
      if (!address) camposFaltando.push("Endereço");
      if (!selectedInstitutionId) camposFaltando.push("Instituição");
      if (!password) camposFaltando.push("Senha");
      if (!confirmPassword) camposFaltando.push("Confirmação de Senha");

      if (camposFaltando.length > 0) {
        setErrorMessage("Preencha todos os campos obrigatórios: " + camposFaltando.join(", "));
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("As senhas não coincidem.");
        return;
      }

      // --- Converte a data de DD/MM/YYYY para YYYY-MM-DD ---
      let formattedDate = birthDate;
      if (birthDate.includes('/')) {
        const parts = birthDate.split('/');
        formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      body = {
        tipo: "jogador",
        nome: userName,
        email: userEmail,
        matricula,
        data_nascimento: formattedDate,
        telefone: phone,
        endereco: address,
        instituicao_id: selectedInstitutionId,
        senha: password,
      };
    }

    if (selectedType === "instituicao") {
      if (!institutionName) camposFaltando.push("Nome da Instituição");
      if (!cnpj) camposFaltando.push("CNPJ");
      if (!institutionEmail) camposFaltando.push("Email");
      if (!institutionPhone) camposFaltando.push("Telefone");
      if (!institutionAddress) camposFaltando.push("Endereço");
      if (!institutionPassword) camposFaltando.push("Senha");
      if (!institutionConfirmPassword) camposFaltando.push("Confirmação de Senha");

      if (camposFaltando.length > 0) {
        setErrorMessage("Preencha todos os campos obrigatórios: " + camposFaltando.join(", "));
        return;
      }

      if (institutionPassword !== institutionConfirmPassword) {
        setErrorMessage("As senhas não coincidem.");
        return;
      }

      body = {
        tipo: "instituicao",
        nome: institutionName,
        cnpj,
        email: institutionEmail,
        telefone: institutionPhone,
        endereco: institutionAddress,
        senha: institutionPassword,
      };
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Erro ao cadastrar.");
        return;
      }

      Alert.alert("Sucesso!", data.message || "Cadastro realizado.");
      router.push("/cadastroSucesso");

    } catch (error) {
      setErrorMessage("Não foi possível conectar ao servidor.");
      console.log(error);
    }
  };

  const renderField = (placeholder, value, setValue, secure = false) => (
    <View style={{ width: '100%' }}>
      <View style={styles.requiredContainer}>
        <Text style={styles.requiredText}>este campo é obrigatório</Text>
        <Text style={styles.requiredStar}>*</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={setValue}
        secureTextEntry={secure}
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>

      {/* ===== BOTÃO DE VOLTAR ===== */}
<Pressable style={styles.voltarButton} onPress={() => router.push('/login')}>
  <Text style={styles.voltarText}>← Voltar</Text>
</Pressable>

      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcome}>Bem-vindo(a) ao ReciclaGame!</Text>

        {errorMessage ? (
          <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{errorMessage}</Text>
        ) : null}

        <View style={styles.typeContainer}>
          <View style={styles.typeLabelContainer}>
            <Text style={styles.typeLabel}>Você é Instituição ou Jogador?</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <View style={styles.radioContainer}>
            <Pressable style={styles.radioOption} onPress={() => setSelectedType('instituicao')}>
              <View style={styles.radioCircle}>
                {selectedType === 'instituicao' && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioText}>Instituição</Text>
            </Pressable>
            <Pressable style={styles.radioOption} onPress={() => setSelectedType('jogador')}>
              <View style={styles.radioCircle}>
                {selectedType === 'jogador' && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioText}>Jogador</Text>
            </Pressable>
          </View>
        </View>

        {selectedType === 'jogador' && (
          <>
            {renderField("Digite seu nome completo", userName, setUserName)}
            {renderField("Digite seu email", userEmail, setUserEmail)}
            {renderField("Digite sua matrícula", matricula, setMatricula)}
            {renderField("Digite sua data de nascimento (DD/MM/YYYY)", birthDate, setBirthDate)}
            {renderField("Digite seu telefone / WhatsApp", phone, setPhone)}
            {renderField("Digite seu endereço", address, setAddress)}

            <View style={{ width: '100%', marginBottom: 20 }}>
              <Text style={{ marginBottom: 5 }}>Selecione sua instituição *</Text>
              <Picker
                selectedValue={selectedInstitutionId}
                onValueChange={(itemValue) => setSelectedInstitutionId(itemValue)}
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10 }}
              >
                <Picker.Item label="Selecione..." value="" />
                {instituicoesList.map(inst => (
                  <Picker.Item key={inst.id} label={inst.nome} value={inst.id} />
                ))}
              </Picker>
            </View>
            

            {renderField("Crie uma senha", password, setPassword, true)}
            {renderField("Confirme a senha", confirmPassword, setConfirmPassword, true)}
          </>
        )}

        {selectedType === 'instituicao' && (
          <>
            {renderField("Digite o nome da instituição", institutionName, setInstitutionName)}
            {renderField("Digite o CNPJ", cnpj, setCnpj)}
            {renderField("Digite o email institucional", institutionEmail, setInstitutionEmail)}
            {renderField("Digite o telefone", institutionPhone, setInstitutionPhone)}
            {renderField("Digite o endereço", institutionAddress, setInstitutionAddress)}
            {renderField("Crie uma senha", institutionPassword, setInstitutionPassword, true)}
            {renderField("Confirme a senha", institutionConfirmPassword, setInstitutionConfirmPassword, true)}
          </>
        )}

        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#fff', alignItems: 'center' },
  container: { width: '90%', alignItems: 'center', padding: 20 },
  logo: { width: 200, height: 200, marginBottom: 10,  marginBottom: 20, shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4, },
  welcome: { fontSize: 22, fontWeight: 'bold', marginBottom: 25 },
  requiredContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 5, marginBottom: 3 },
  requiredText: { fontSize: 12, color: '#000', fontStyle: 'italic' },
  requiredStar: { fontSize: 14, color: 'red', marginLeft: 3 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 20 },
  typeContainer: { width: '100%', marginBottom: 20 },
  typeLabelContainer: { flexDirection: 'row', marginLeft: 5, marginBottom: 8 },
  typeLabel: { fontSize: 13, fontWeight: '500' },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  radioOption: { flexDirection: 'row', alignItems: 'center' },
  radioCircle: { width: 20, height: 20, borderWidth: 1, borderColor: '#aaa', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  radioSelected: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#28a745' },
  radioText: { fontSize: 14 },
  button: { backgroundColor: '#28a745', width: '100%', padding: 15, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginText: { marginTop: 20, color: '#28a745', fontSize: 14, fontStyle: 'italic' },
  voltarButton: { alignSelf: 'flex-start', marginBottom: 15, padding:20},
voltarText: {color: '#28a745', fontSize: 16, fontWeight: '500',  fontWeight: 'bold'},
});
 