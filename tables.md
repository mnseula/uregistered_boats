notes:
SEL_ONE_SER_NO_MST
SELECT * FROM  warrantyparts.SerialNumberMaster WHERE Boat_SerialNo = @PARAM1 

WS_GET_UNREG_BOATS_ALL
SELECT
t1.*
From SerialNumberMaster as t1
left JOIN SerialNumberRegistrationStatus as t2
ON (t1.Boat_SerialNo = t2.Boat_SerialNo)
WHERE t2.Registered = 0 
AND t1.SN_MY > 14

